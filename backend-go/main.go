package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"golang.org/x/crypto/bcrypt"
)

var usersColl *mongo.Collection

type Team struct {
	ID   primitive.ObjectID `json:"id,omitempty" bson:"_id"`
	Name string             `json:"name"`
}

type User struct {
	ID             primitive.ObjectID `json:"id,omitempty" bson:"_id"`
	Email          string             `json:"email" binding:"required,email"`
	Password       string             `json:"password" binding:"required,min=6"`
	EmailConfirmed bool               `json:"emailConfirmed"`
	CreatedAt      time.Time          `json:"createdAt"`
	UpdatedAt      time.Time          `json:"updatedAt"`
}

type UserEmail struct {
	Email string `json:"email" binding:"required,email"`
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
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Panic(err)
	}
	return string(bytes)
}

func VerifyPassword(userPassword string, providedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(providedPassword), []byte(userPassword))
	return err != nil
}

func ApiFail(c *gin.Context, httpCode int, message string) {
	c.JSON(httpCode, gin.H{"success": false, "message": message})
}

func ApiDone(c *gin.Context, httpCode int, o interface{}) {
	data, _ := json.Marshal(o)
	c.JSON(httpCode, gin.H{"success": true, "data": string(data)})
}

func CreateUser(c *gin.Context) {
	var user User

	if err := c.BindJSON(&user); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	if count, _ := usersColl.CountDocuments(c, bson.M{"email": user.Email}); count > 0 {
		ApiFail(c, http.StatusBadRequest, "email_already_used")
		return
	}

	newUser := User{
		ID:             primitive.NewObjectID(),
		Email:          user.Email,
		Password:       HashPassword(user.Password),
		EmailConfirmed: false,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if _, err := usersColl.InsertOne(c, newUser); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	ApiDone(c, http.StatusCreated, newUser)
}

func CheckUserEmailExist(c *gin.Context) {
	var userEmail UserEmail

	if err := c.BindJSON(&userEmail); err != nil {
		ApiFail(c, http.StatusBadRequest, err.Error())
		return
	}

	count, _ := usersColl.CountDocuments(c, bson.M{"email": userEmail.Email})
	c.JSON(http.StatusOK, gin.H{"success": true, "exists": count > 0})
}

func main() {
	db := Connect()
	usersColl = db.Collection("users")

	r := gin.Default()

	r.POST("/users/create", CreateUser)
	r.POST("/users/checkEmail", CheckUserEmailExist)

	r.Run("127.0.0.1:9000")
}
