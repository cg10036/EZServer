import express from "express";
import ezserver from "../ezserver";

const app = express();
ezserver(app).then(() => app.listen(80));
