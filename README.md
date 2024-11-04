1. Terminal lange nusinaviguojame į server aplanką, o kitame terminal lange į client aplanką.
2. Norint pasileisti pirma reikia įsirašyti node models, terminal lange rašone npm i arba npm install
3. Reikia server root aplanke susikurti .env failą ir jame turi būti, kur vietoj žvaigždučių įrašome reikiamas reikšmes.
PORT = 5000
MONGO_URL = ****
JWT_SECRET = ****
CLOUDINARY_CLOUD_NAME=****
CLOUDINARY_API_KEY=****
CLOUDINARY_API_SECRET=****
4. Čia reikes susikurti mongo db ir įkelti nuorodą, jwt galima susigeneruoti internete ar savo įrašyti ir cloudinary susikuri nauja varotoją, 
jei neturi ir įrašyti reikšmes kokių prašoma.
5. server veikia http://localhost:5000
6. client veikia http://localhost:3000
7. server paleidžiame parašydami npm start
8. client paleidžiame parašydami npm start

