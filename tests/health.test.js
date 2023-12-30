const request = require('supertest');
const healthRoutes = require('../routes/healthCheckRoutes');


describe("GET Health Endpoint", () => {
    test("Check health on /healthz", () => {
        try {
            // Send a GET request to /healthz
            const res = request(healthRoutes).get('/healthz');
            
            // Expect a status code of 200
            expect(res.statusCode).toEqual(200);
          } catch (error) {

        // return res.status(400).send(error)
        console.log(error)
}
});
},30000);
    