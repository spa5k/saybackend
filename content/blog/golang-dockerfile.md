---
external: false
title: "Store Zustand State into URL, Sharing State Across the Web"
description: "In this tutorial, we'll explore how to Store Zustand state into the URL as a hash. Zustand is a lightweight state management framework that simplifies managing the state of your application. With URL hash storage, we can maintain the application's state even when the user navigates away from the current page. And let user copy the URL and share it with others, so that they can see the same state as the user."
date: 2023-12-29T00:00:00.000Z
ogImagePath: /images/zustand-og.png
ogImageAltText: zustand-og
ogImageWidth: 1200
ogImageHeight: 630
draft: true
tags:
  - docs
  - react
  - zustand
  - tips
---

<img src="/images/zustand-og.png" alt="Zustand" width="400px" height="250px">

## Introduction

Creating Dockerfile for Golang in order to containerize your application is a good practice, but sometimes, you can optimize it even more by using various techniques that we will be discussing in this article.

## Generic Dockerfile

Generally, you will find this common Dockerfile for Golang:

> It's always recommended to use the latest version of Golang, (but don't use the latest tag)

```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.22-alpine

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o main .

CMD ["./main"]
```
