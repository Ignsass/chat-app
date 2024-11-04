import mongoose from 'mongoose';
import User from './model/userModel.js'; // Įsitikink, kad kelias yra teisingas
import generateColor from './utils/generateColor.js'; // Naudojama spalvos generavimui
import dotenv from 'dotenv';

dotenv.config();

// Prijungiamės prie MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

const updateUsersWithAvatarColor = async () => {
  try {
    // Randa vartotojus be `avatarColor` ir priskiria jiems spalvą pagal `username`
    const usersWithoutColor = await User.find({ avatarColor: { $exists: false } });

    for (const user of usersWithoutColor) {
      const color = generateColor(user.username);
      user.avatarColor = color;
      await user.save();
      console.log(`Updated ${user.username} with color ${color}`);
    }

    console.log("Vartotojai atnaujinti sėkmingai");
  } catch (err) {
    console.error("Klaida atnaujinant vartotojus:", err);
  } finally {
    mongoose.connection.close();
  }
};

// Paleidžia atnaujinimo funkciją
updateUsersWithAvatarColor();
