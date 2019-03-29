import express, {
  json,
  Router
} from 'express';
import {
  readFileSync
} from 'fs';
import cors from 'cors';
const PORT = 4000;
const delay = 100;

const app = express();
app.use(json(), cors({
  origin: true
}));
const apiRoutes = Router();

function sendAuthenticated({
  headers
}, res, data) {
  if (headers.authorization &&
    headers.authorization.indexOf('Bearer') === 0) {
    res.send(data);
  } else {
    res.status(401).end();
  }
}

function loadData(path) {
  try {
    return JSON.parse(readFileSync(require.resolve(path)));
  } catch (error) {
    return {
      error
    };
  }
}

function sendResponse(req, res, data) {
  if (data) {
    sendAuthenticated(req, res, data);
  } else {
    res
      .status(400)
      .send('unexpected error please try again shortly.');
  }
}

app.use('/api', apiRoutes);

apiRoutes.route('/authServer').get((req, res, next) => {
  setTimeout(() => {
    res.send(require('./data/maam.json'));
  }, delay);
});

apiRoutes.route('/contract').get((req, res, next) => {
  setTimeout(() => {
    const dataDictionary = loadData('./data/contracts.json');
    const contractNumber = req.query.contractNumber * 1;

    sendResponse(req, res, dataDictionary[contractNumber]);
  }, delay);
});

apiRoutes.route('/simulation').post((req, res, next) => {
  setTimeout(() => {
    const {
      contractNumber,
      ref
    } = req.body;
    const simulationsPerContrat = loadData('./data/simulations.json')[contractNumber];

    const simulationsPerRef = simulationsPerContrat.data.simulationsPerRef
      .filter(simulation => ref.includes(simulation.refValue.toFixed(0)));
    const outputSimulation = {
      ...simulationsPerContrat
    };
    outputSimulation.data.simulationsPerRef = simulationsPerRef;

    sendResponse(req, res, outputSimulation);
  }, delay);
});

apiRoutes.route('/calculRef').post((req, res, next) => {
  setTimeout(() => {
    const dataDictionary = loadData('./data/calculRef.json');
    const {
      incoming
    } = req.body;
    sendResponse(req, res, dataDictionary[incoming]);
  }, delay);
});

app.listen(PORT, () => {
  console.log(`Mocks server listening on port ${PORT}!`);
});
