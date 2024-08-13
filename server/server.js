const mysql = require("mysql");
const express = require("express");

const app = express();

app.use(function (request, response, next) {
    response.append("Access-Control-Allow-Origin", "*");
    response.append("Access-Control-Allow-Methods", "GET");
    response.append("Access-Control-Allow-Headers", "Content-Type");
    response.append("Content-Type", "application/json");
    next();
});

app.listen(8080, function () {
    console.log("Server is running on http://localhost:8080");
});

const con = mysql.createConnection({
    host: "d26893.mysql.zonevs.eu",
    user: "d26893_busstops",
    password: "3w7PYquFJhver0!KdOfF",
    database: "d26893_busstops",
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.get("/", function (request, response) {
    response.send("Welcome to the Bus Stop Server");
});

app.get("/getArea", function (request, response) {
    const sql = "SELECT DISTINCT stop_area FROM stops";
    con.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }

        const uniqueValuesArray = result.map((row) => row.stop_area);

        response.send(uniqueValuesArray);
    });
});

app.get("/getStops/:region", function (request, response) {
    const sql = `SELECT DISTINCT stop_name FROM stops WHERE stop_area = '${request.params.region}'`;
    con.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }
        const uniqueValuesArray = result.map((row) => row.stop_name);
        response.send(uniqueValuesArray);
    });
});

app.get("/getCoordinates/:lat/:lon", function (request, response) {
    const sql = `
        SELECT stop_name, stop_area, stop_lat, stop_lon,
        6371 * acos(cos(radians(${request.params.lat})) * cos(radians(stop_lat)) * cos(radians(stop_lon) - radians(${request.params.lon})) + sin(radians(${request.params.lat})) * sin(radians(stop_lat))) AS distance
        FROM stops
        ORDER BY distance
        LIMIT 1`;
    con.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }
        response.send(result);
    });
});

app.get("/getBuses/:stop_id", function (request, response) {
    const sql = `
      SELECT DISTINCT route_short_name FROM routes
      JOIN trips ON trips.route_id = routes.route_id
      JOIN stop_times ON stop_times.trip_id = trips.trip_id
      JOIN stops ON stops.stop_id = stop_times.stop_id
      WHERE stops.stop_id = '${request.params.stop_id}'`;

    con.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }
        const routeShortNames = result.map(route => route.route_short_name);
        response.send(routeShortNames);
    });
});

app.get("/getId/:stop", function (request, response) {
    const sql = "SELECT stop_id FROM stops WHERE stop_name = ?";
    con.query(sql, [request.params.stop], function (err, result) {
        if (err) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }
        const stopids = result.map(ids => ids.stop_id);
        response.send(stopids);
    });
});

app.get("/getSaabumised/:bussName/:stopName/:arrivalTime", function (request, response) {
    const sql = `
        SELECT DISTINCT arrival_time FROM routes
        JOIN trips ON trips.route_id = routes.route_id
        JOIN stop_times ON stop_times.trip_id = trips.trip_id
        JOIN stops ON stops.stop_id = stop_times.stop_id
        WHERE route_short_name = '${request.params.bussName}' AND stop_name = '${request.params.stopName}' AND arrival_time > '${request.params.arrivalTime}'
        ORDER BY arrival_time ASC;`;

    con.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            response.status(500).send("Internal Server Error");
            return;
        }
        const times = result.map(Element => Element.arrival_time);
        response.send(times);
    });
});