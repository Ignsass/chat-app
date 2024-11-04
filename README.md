Terminal lange nusinaviguojame į server aplanką, o kitame terminal lange į client aplanką.
Norint pasileisti pirma reikia įsirašyti node models, terminal lange rašone npm i arba npm install
Reikia server root aplanke susikurti .env failą ir jame turi būti, kur vietoj žvaigždučių įrašome reikiamas reikšmes.
PORT = 5000
MONGO_URL = ****
JWT_SECRET = ****
CLOUDINARY_CLOUD_NAME=****
CLOUDINARY_API_KEY=****
CLOUDINARY_API_SECRET=****
Čia reikes susikurti mongo db ir įkelti nuorodą, jwt galima susigeneruoti internete ar savo įrašyti ir cloudinary susikuri nauja varotoją, 
jei neturi ir įrašyti reikšmes kokių prašoma.
server veikia http://localhost:5000
client veikia http://localhost:3000
server paleidžiame parašydami npm start
client paleidžiame parašydami npm start

