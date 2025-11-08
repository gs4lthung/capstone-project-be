<div>
<img src="https://images.viblo.asia/3d6ca316-56fc-426a-90e2-aef511a892a1.png" width="150"/>
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXS_oT8x5yhHKoxseTXxkvoK0GJQ9r5XYzag&s" width="150"/>
<img src="https://avatars.githubusercontent.com/u/20165699?s=200&v=4" width="150"/>
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzyLwczXxezKsQjX4t5uvXGWDvlwwOwuX-1A&s" width="150"/>
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjloIPOuknHArREi42VzEA9B_hliKHyHDyJftp1Ww52_QOfajM1UN_LyNLd7ExNcyMVc8&usqp=CAU" width="150"/>
</div>

# Capstone Project Backend

## Introduction

- Project using `Nestjs` framework and implemented as a microservice.
- For interating with `PostgreSQL` database, I use `TypeORM`.
- Store files as well as images on `AWS S3`.
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
