import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import auth from './middleware/auth';
import api from './api';
import config from './config'
import timeGraph from './graph/graph_time'
import distanceGraph from './graph/graph_distance'

let app = express();
app.server = http.createServer(app);


app.use(morgan('dev'));
app.use(cors({ exposedHeaders: config.corsHeaders }));
app.use(bodyParser.json({ limit : config.bodyLimit }));
app.use(auth({ config }));
app.use('/', express.static(__dirname + '/public'));
app.use('/api', api(timeGraph, distanceGraph));

app.server.listen(process.env.PORT || config.port);

console.log(`> Jaime's TCC Web API`);
console.log(`> Started on port ${app.server.address().port}`);

export default app;
