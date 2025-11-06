<div>
<img src="https://images.viblo.asia/3d6ca316-56fc-426a-90e2-aef511a892a1.png" width="150"/>
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXS_oT8x5yhHKoxseTXxkvoK0GJQ9r5XYzag&s" width="150"/>
<img src="https://avatars.githubusercontent.com/u/20165699?s=200&v=4" width="150"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/2048px-GraphQL_Logo.svg.png" width="150"/>
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9nQnDfWyIhVbhOcI9JS0gxwX4wbIXetMNCm8SYbgJLuVJd7aem1wOkBo7TIWumTZtkJ0&usqp=CAU" width="150"/>
<img src="https://www.myqnap.org/wp-content/uploads/telecharge-4.png" width="150"/>
<img src="https://firebase.google.com/static/images/brand-guidelines/logo-vertical.png" width="150"/>
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP5BaOYcOW7WwQHHIzIjxfyH1giTa3_KSrJQ&s" width="150"/>
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzyLwczXxezKsQjX4t5uvXGWDvlwwOwuX-1A&s" width="150"/>
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjloIPOuknHArREi42VzEA9B_hliKHyHDyJftp1Ww52_QOfajM1UN_LyNLd7ExNcyMVc8&usqp=CAU" width="150"/>
</div>

# Capstone Project Backend

## Introduction

- Project using `Nestjs` framework and implemented as a microservice.
- For interating with `PostgreSQL` database, I use `TypeORM`.
- Fetching data with `GraphQL`.
- For microservices's interaction, I implemented **queue messaging** with `RabbitMQ`.
- Using `Redis` for caching and storing data.
- Push notifications using `Firebase Cloud Messaging`.
- Store files as well as images on `Cloudinary`.
- Payment with `PayOS`.
- Use `Docker` in building process.

## Installation

### Use `npm` package for install

```bash
npm install
```

## Usage

### Run all services

```bash
npm run start:all
```

### Run a **specific service** (See more in `package.json`)

```bash
npm run start:${service}
```

### Migration database

Generate migration file

```bash
npm run migration:generate ./libs/database/src/migrations/migration
```

Run migration file

```bash
npm run migration:run
```

### Build all services

```bash
npm run build:all
```

### Build a **specific service**

```bash
npm run build:${service}
```

### Docker compose

```bash
docker compose up -d
```
