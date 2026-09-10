# Digital Book - NestJS Backend

## Description

Digital Book is a comprehensive application designed to offer a rich set of features for book enthusiasts and knowledge workers. The platform provides an enjoyable reading experience with integrated tools for PDFs, search capabilities, AI-powered assistance, and note-taking functionality.

This backend API currently implements the **Notes feature** - a sophisticated note management system with rich text editing using Quill Delta format. The Notes feature includes:

- Rich text editing with Quill Delta format
- Organization with tags and categories
- Soft deletion and favorites
- Search capabilities

As the project grows, features like Notes can evolve into independent microservices, enabling flexible scaling and deployment strategies.

Built with [NestJS](https://nestjs.com) - a progressive Node.js framework for building efficient and scalable server-side applications.

### Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Storage**: JSON files (temporary, database migration planned)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

This project uses **Swagger/OpenAPI** for interactive API documentation.

### Access Documentation

Once the server is running, visit:

- **Swagger UI**: [http://localhost:3000/api](http://localhost:3000/api)
- **OpenAPI JSON**: [http://localhost:3000/api-json](http://localhost:3000/api-json)

### Import to Postman

You can import the OpenAPI spec directly into Postman:

1. Start the development server: `npm run start:dev`
2. In Postman: **Import** → **Link**
3. Enter: `http://localhost:3000/api-json`
4. Click **Continue** and **Import**

This automatically generates a complete Postman collection from the live API specification.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deploy

Using Google Cloud with Firebase.

- [Project Overview](https://console.firebase.google.com/project/digital-book-fbaa0/overview)
- [Project settings](https://console.firebase.google.com/project/digital-book-fbaa0/settings/general/web:NGI3MTIzYzgtMDA5ZS00NjNmLTgyOTUtYWEwZDM2NjdiOTU5)
- [Hosting](https://console.firebase.google.com/project/digital-book-fbaa0/hosting/sites/digital-book-fbaa0)
- [Functions](https://console.firebase.google.com/project/digital-book-fbaa0/functions)
- [SQL connect](https://console.firebase.google.com/project/digital-book-fbaa0/dataconnect/locations/us-east4/services/digital-book-fbaa0-service/data?selectedTab=Note&view=table-view&r=2)
- [Users](https://console.firebase.google.com/project/digital-book-fbaa0/authentication/users)

### Some Docs

- [Sign in users with email and password](https://docs.cloud.google.com/identity-platform/docs/sign-in-user-email)
- [SQL connect](https://firebase.google.com/docs/sql-connect)

### Some Commands

`firebase login` <br>
`firebase login --reauth` <br>
`firebase login:ci` (generate a new token) <br>
`firebase dataconnect:sql:shell --project digital-book-fbaa0` (Open Cloud SQL Shell) <br>
`gcloud auth application-default login` (This re-authenticates ADC for the admin. For local development) <br>
`firebase dataconnect:sdk:generate` (generate new schema, queries, mutations)

## License

MIT
