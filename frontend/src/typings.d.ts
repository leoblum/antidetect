declare module '*.theme.less' {
  interface LessLazyTheme {
    use(): void
    unuse(): void
  }

  const module: LessLazyTheme
  export = module
}
