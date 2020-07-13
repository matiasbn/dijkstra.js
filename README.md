# Dijkstra.js

Dijkstra.js is a Rest API that obtains the shortest path between an origin and one or all other nodes of an adjacency table.

Data can be loaded both by uploading a text file or by generating it in a random fashion.

# Usage

## Prerequisites

* Node.JS >= v12.18.0
* MongoDB
* Redis

## Setup locally

Install all the packages:
```bash
npm install
```

Create an `.env` file at the root path of this repository according to the [env-example](https://github.com/matiasbn/dijkstra.js/blob/master/env-example) file.
It needs to URI to connect both to Redis and Mongo.

Then run it locally:
```
npm run dev
```

It would start listening at port 3333.

## Heroku deployment

The project is ready to use, without authentication in this [url](https://dijkstra-api.herokuapp.com/).

## Documentation

The documentation for this API can be found [here](https://documenter.getpostman.com/view/6223340/T17NbjqB?version=latest).

## example-file.txt

An [example-file.txt](https://github.com/matiasbn/dijkstra.js/blob/master/example-file.txt) can be found at the root path of this project, which includes the correct format.
It can only support single letters nodes, comma separated, without limit on nodes distance.

## Dijkstra algorithm

The Dijkstra algorithm can be found in the ApiService class, in the [line 136](https://github.com/matiasbn/dijkstra.js/blob/ac539bb191c78a19087085988589159f47035b59/apps/dijkstra/src/api/services/api.service.ts#L136)
of the dijkstra method.

## Example

The project is deployed in this [URL](https://dijkstra-api.herokuapp.com/).

You can start by loading your data using the example-file.txt file or by calling the [generate-data](https://documenter.getpostman.com/view/6223340/T17NbjqB?version=latest#a49a7135-001a-4e29-ba06-817f0062eb61) endpoint.

Then, you can use to the [shortest-path](https://documenter.getpostman.com/view/6223340/T17NbjqB?version=latest#e69ec7c5-f6a2-402e-9651-86d91c712484) endpoint to get the shortest path between 
origin and destination, or you can use the [all-paths](https://documenter.getpostman.com/view/6223340/T17NbjqB?version=latest#914ec2f8-bab2-4d98-b898-9a1b2b996e06) to get all the shortest paths to/from origin node.
