package main

import (
	"context"
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"golang.org/x/crypto/bcrypt"
)

const SECRET_KEY = "1234"

var fingerprint FingerprintBothOS

var usersColl *mongo.Collection
var proxiesColl *mongo.Collection

type User struct {
	ID             primitive.ObjectID `json:"id,omitempty" bson:"_id"`
	Email          string             `json:"email" bson:"email" binding:"required,email"`
	Password       string             `json:"password,omitempty" bson:"password" binding:"required,min=6"`
	EmailConfirmed bool               `json:"emailConfirmed" bson:"emailConfirmed"`
	CreatedAt      time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt      time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type Proxy struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id"`
	TeamId    primitive.ObjectID `json:"teamId,omitempty" bson:"teamId"`
	Name      string             `json:"name" binding:"required"`
	Type      string             `json:"type" binding:"required,oneof=socks5 http https"`
	Host      string             `json:"host" binding:"required,hostname"`
	Port      int                `json:"port" binding:"required"`
	Username  string             `json:"username,omitempty"`
	Password  string             `json:"password,omitempty"`
	Country   string             `json:"country"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type UserEmail struct {
	Email string `json:"email" binding:"required,email"`
}

type JwtPayload struct {
	UserId    primitive.ObjectID
	ExpiresAt int64
}

type OSFingerprintOptions struct {
	Screen    []string `json:"screen"`
	CPU       []int    `json:"cpu"`
	RAM       []int    `json:"ram"`
	Fonts     []string `json:"fonts"`
	UserAgent []string `json:"ua"`
	Renderer  []string `json:"renderer"`
}

type OSFingerprint struct {
	Screen    string `json:"screen"`
	CPU       int    `json:"cpu"`
	RAM       int    `json:"ram"`
	Fonts     string `json:"fonts"`
	UserAgent string `json:"ua"`
}

type FingerprintBothOS struct {
	Win OSFingerprintOptions `json:"win"`
	Mac OSFingerprintOptions `json:"mac"`
}

func (p JwtPayload) Valid() error {
	if p.ExpiresAt < time.Now().Local().Unix() {
		return errors.New("auth: token_expired")
	}
	return nil
}

func Connect() *mongo.Database {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	client, _ := mongo.NewClient(clientOptions)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	_ = client.Connect(ctx)
	defer cancel()

	err := client.Ping(context.Background(), readpref.Primary())
	if err != nil {
		log.Fatal("Couldn't connect to the database", err)
	} else {
		log.Println("Connected!")
	}

	return client.Database("yanus-test")
}

func HashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		log.Panic(err)
	}
	return string(bytes)
}

func VerifyPassword(userPassword string, providedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(providedPassword), []byte(userPassword))
	return err == nil
}

func ApiFail(c *gin.Context, httpCode int, message string) {
	c.JSON(httpCode, gin.H{"success": false, "message": message})
}

func ApiFailWithAbort(c *gin.Context, httpCode int, message string) {
	c.JSON(httpCode, gin.H{"success": false, "message": message})
	c.Abort()
}

func ApiDone(c *gin.Context, httpCode int, o interface{}) {
	c.JSON(httpCode, gin.H{"success": true, "data": o})
}

func CreateUser(c *gin.Context) {
	var user User

	if err := c.BindJSON(&user); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	if count, _ := usersColl.CountDocuments(context.TODO(), bson.M{"email": user.Email}); count > 0 {
		ApiFail(c, http.StatusBadRequest, "email_already_used")
		return
	}

	user.ID = primitive.NewObjectID()
	user.Password = HashPassword(user.Password)
	user.EmailConfirmed = false
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	if _, err := usersColl.InsertOne(context.TODO(), user); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	user.Password = ""
	ApiDone(c, http.StatusCreated, user)
}

func CheckEmailExist(c *gin.Context) {
	var userEmail UserEmail

	if err := c.BindJSON(&userEmail); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	count, _ := usersColl.CountDocuments(context.TODO(), bson.M{"email": userEmail.Email})
	ApiDone(c, http.StatusOK, gin.H{"exists": count > 0})
}

func ConfirmEmail(c *gin.Context) {
	var userEmail UserEmail
	var foundUser User

	if err := c.BindJSON(&userEmail); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := usersColl.FindOne(context.TODO(), bson.M{"email": userEmail.Email}).Decode(&foundUser); err != nil {
		ApiFail(c, http.StatusBadRequest, "user_not_found")
		return
	}

	if foundUser.EmailConfirmed {
		ApiFail(c, http.StatusBadRequest, "email_already_confirmed")
		return
	}

	q := bson.M{
		"$set": bson.M{
			"emailConfirmed": true,
			"updatedAt":      time.Now(),
		},
	}

	if _, err := usersColl.UpdateByID(context.TODO(), foundUser.ID, q); err != nil {
		ApiFail(c, http.StatusInternalServerError, err.Error())
		return
	}

	ApiDone(c, http.StatusOK, gin.H{})
}

func LoginUser(c *gin.Context) {
	var user, foundUser User

	if err := c.BindJSON(&user); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := usersColl.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&foundUser); err != nil {
		ApiFail(c, http.StatusUnauthorized, "user_not_found")
		return
	}

	if !foundUser.EmailConfirmed {
		ApiFail(c, http.StatusUnauthorized, "email_not_confirmed")
		return
	}

	if !VerifyPassword(user.Password, foundUser.Password) {
		ApiFail(c, http.StatusUnauthorized, "wrong_password")
		return
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, JwtPayload{
		UserId:    foundUser.ID,
		ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(24)).Unix(),
	}).SignedString([]byte(SECRET_KEY))

	if err != nil {
		panic(err)
	}

	ApiDone(c, http.StatusOK, gin.H{
		"token": token,
	})
}

func AuthMiddleware(c *gin.Context) {
	header := c.Request.Header.Get("Authorization")
	parts := strings.Split(header, " ")
	if len(parts) != 2 {
		ApiFailWithAbort(c, http.StatusUnauthorized, "invalid_auth_headers")
		return
	}

	token, err := jwt.ParseWithClaims(parts[1], &JwtPayload{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(SECRET_KEY), nil
	})

	if err != nil {
		ApiFailWithAbort(c, http.StatusUnauthorized, err.Error())
		return
	}

	claims := token.Claims.(*JwtPayload)
	c.Set("JwtPayload", claims)
	c.Next()
}

func GetJwtPayload(c *gin.Context) *JwtPayload {
	claims, exists := c.Get("JwtPayload")
	if !exists {
		return &JwtPayload{}
	}
	return claims.(*JwtPayload)
}

func CheckToken(c *gin.Context) {
	ApiDone(c, http.StatusOK, gin.H{})
}

func randomHardware(os string) OSFingerprint {
	var fp OSFingerprintOptions
	if os == "win" {
		fp = fingerprint.Win
	}
	if os == "mac" {
		fp = fingerprint.Mac
	}

	return OSFingerprint{
		Screen:    fp.Screen[rand.Intn(len(fp.Screen))],
		CPU:       fp.CPU[rand.Intn(len(fp.CPU))],
		RAM:       fp.RAM[rand.Intn(len(fp.RAM))],
		UserAgent: fp.UserAgent[rand.Intn(len(fp.UserAgent))],
	}
}

func GetFingerprint(c *gin.Context) {
	var acceptLanguage string

	// Accept-Language: en-US,en-GB;q=0.5
	header := c.Request.Header.Get("Accept-Language")
	langs := strings.Split(header, ",")
	if len(langs) > 0 {
		parts := strings.Split(langs[0], ";")
		acceptLanguage = strings.Split(parts[0], "-")[0]
	}

	os := []string{"win", "mac"}

	ApiDone(c, http.StatusOK, gin.H{
		"fingerprint": gin.H{
			"os":  os[rand.Intn(len(os))],
			"win": randomHardware("win"),
			"mac": randomHardware("mac"),

			"noiseWebGl":  true,
			"noiseCanvas": false,
			"noiseAudio":  true,

			"deviceCameras":     1,
			"deviceMicrophones": 1,
			"deviceSpeakers":    1,

			"languages":   gin.H{"mode": "ip", "value": acceptLanguage},
			"timezone":    gin.H{"mode": "ip"},
			"geolocation": gin.H{"mode": "ip"},
		},
	})
}

func FingerprintOptions(c *gin.Context) {
	ApiDone(c, http.StatusOK, fingerprint)
}

func CreateProxy(c *gin.Context) {
	var proxy Proxy
	claims := GetJwtPayload(c)

	if err := c.BindJSON(&proxy); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	proxy.ID = primitive.NewObjectID()
	proxy.TeamId = claims.UserId
	proxy.CreatedAt = time.Now()
	proxy.UpdatedAt = time.Now()

	if _, err := proxiesColl.InsertOne(context.TODO(), proxy); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	ApiDone(c, http.StatusCreated, gin.H{"proxy": proxy})
}

func ProxiesList(c *gin.Context) {
	claims := GetJwtPayload(c)

	cur, err := proxiesColl.Find(context.TODO(), bson.M{"teamId": claims.UserId})
	if err != nil {
		return
	}

	proxies := make([]Proxy, 0)
	if err := cur.All(context.TODO(), &proxies); err != nil {
		log.Fatal(err)
	}

	ApiDone(c, http.StatusOK, gin.H{"proxies": proxies})
}

func main() {
	file, err := ioutil.ReadFile("../backend/src/~fingerprints.json")
	if err != nil {
		log.Fatal(err)
		return
	}

	json.Unmarshal(file, &fingerprint)

	db := Connect()
	usersColl = db.Collection("users")
	proxiesColl = db.Collection("proxies")

	r := gin.Default()

	r.POST("/users/create", CreateUser)
	r.POST("/users/login", LoginUser)
	r.POST("/users/checkEmail", CheckEmailExist)
	r.POST("/users/confirmEmail", ConfirmEmail)

	p := r.Group("/")
	p.Use(AuthMiddleware)

	p.GET("/users/checkToken", CheckToken)

	p.GET("/fingerprint", GetFingerprint)
	p.GET("/fingerprint/options", FingerprintOptions)

	p.GET("/proxies", ProxiesList)
	p.POST("/proxies/save", CreateProxy)

	r.Run("127.0.0.1:9000")
}
