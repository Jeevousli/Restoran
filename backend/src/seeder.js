const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config({ path: "./.env" });

const Category = require("./models/Category");
const Product = require("./models/Product");

const categories = [
  { category_name: "Aneka Nasi" },
  { category_name: "Minuman" },
  { category_name: "Makanan" },
  { category_name: "Snack & Cemilan" },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log("MongoDB Connected ✅");

    await Category.deleteMany();
    await Product.deleteMany();
    console.log("Data lama dihapus 🗑️");

    const insertedCategories = await Category.insertMany(categories);
    console.log("Categories berhasil diinsert ✅");

    const anekaNasi = insertedCategories[0]._id;
    const minuman = insertedCategories[1]._id;
    const makanan = insertedCategories[2]._id;
    const snack = insertedCategories[3]._id;

    const products = [
      // Aneka Nasi
      {
        name: "Nasi Goreng Spesial",
        description: "Nasi goreng dengan telur, ayam, dan sayuran segar",
        price: 25000,
        rating: 4.8,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Nasi_goreng_2.jpg/800px-Nasi_goreng_2.jpg",
        category_id: anekaNasi,
      },
      {
        name: "Nasi Kuning",
        description: "Nasi kuning gurih dengan lauk ayam, tempe, dan sambal",
        price: 20000,
        rating: 4.6,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Nasi_kuning.jpg/800px-Nasi_kuning.jpg",
        category_id: anekaNasi,
      },
      {
        name: "Nasi Uduk",
        description: "Nasi uduk gurih dengan lauk lengkap dan kerupuk",
        price: 18000,
        rating: 4.5,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Nasi_uduk.jpg/800px-Nasi_uduk.jpg",
        category_id: anekaNasi,
      },
      {
        name: "Nasi Bakar Ayam",
        description: "Nasi yang dibakar bersama ayam suwir berbumbu",
        price: 28000,
        rating: 4.7,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Nasi_goreng_2.jpg/800px-Nasi_goreng_2.jpg",
        category_id: anekaNasi,
      },

      // Minuman
      {
        name: "Es Teh Manis",
        description: "Teh manis segar dengan es batu pilihan",
        price: 5000,
        rating: 4.9,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Iced_tea_2.jpg/800px-Iced_tea_2.jpg",
        category_id: minuman,
      },
      {
        name: "Es Kopi Susu",
        description: "Kopi susu dingin dengan campuran gula aren asli",
        price: 18000,
        rating: 4.8,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/800px-A_small_cup_of_coffee.JPG",
        category_id: minuman,
      },
      {
        name: "Jus Alpukat",
        description: "Jus alpukat segar dengan susu kental manis",
        price: 15000,
        rating: 4.7,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Avocado_juice.jpg/800px-Avocado_juice.jpg",
        category_id: minuman,
      },
      {
        name: "Lemon Tea",
        description: "Teh segar dengan perasan lemon dan madu",
        price: 12000,
        rating: 4.6,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Iced_tea_lemon.jpg/800px-Iced_tea_lemon.jpg",
        category_id: minuman,
      },

      // Makanan
      {
        name: "Ayam Geprek",
        description: "Ayam goreng crispy geprek dengan sambal bawang pedas",
        price: 22000,
        rating: 4.8,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Ayam_bakar.jpg/800px-Ayam_bakar.jpg",
        category_id: makanan,
      },
      {
        name: "Mie Ayam Bakso",
        description: "Mie ayam dengan bakso sapi dan pangsit goreng",
        price: 18000,
        rating: 4.9,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Mie_goreng.jpg/800px-Mie_goreng.jpg",
        category_id: makanan,
      },
      {
        name: "Soto Ayam",
        description: "Soto ayam bening segar dengan lauk lengkap",
        price: 20000,
        rating: 4.5,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Soto_ayam_lontong.jpg/800px-Soto_ayam_lontong.jpg",
        category_id: makanan,
      },
      {
        name: "Bubur Ayam",
        description: "Bubur ayam lembut dengan topping lengkap dan kerupuk",
        price: 12000,
        rating: 4.8,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Nasi_goreng_2.jpg/800px-Nasi_goreng_2.jpg",
        category_id: makanan,
      },

      // Snack & Cemilan
      {
        name: "Pisang Goreng Keju",
        description: "Pisang goreng crispy dengan lelehan keju melimpah",
        price: 12000,
        rating: 4.7,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Pisang_goreng.jpg/800px-Pisang_goreng.jpg",
        category_id: snack,
      },
      {
        name: "Kentang Goreng",
        description: "Kentang goreng renyah dengan saus sambal dan keju",
        price: 15000,
        rating: 4.5,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Bowl_of_chili.jpg/800px-Bowl_of_chili.jpg",
        category_id: snack,
      },
      {
        name: "Cireng Isi Ayam",
        description: "Cireng isi ayam suwir pedas dengan bumbu kacang",
        price: 10000,
        rating: 4.4,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cireng.jpg/800px-Cireng.jpg",
        category_id: snack,
      },
      {
        name: "Tahu Crispy",
        description: "Tahu goreng crispy bumbu balado dengan taburan bawang",
        price: 8000,
        rating: 4.6,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Pisang_goreng.jpg/800px-Pisang_goreng.jpg",
        category_id: snack,
      },
    ];

    await Product.insertMany(products);
    console.log("Products berhasil diinsert ✅");

    console.log("\n================================");
    console.log("✅  SEEDER SELESAI!");
    console.log(`📂  ${insertedCategories.length} Categories`);
    console.log(`🍜  ${products.length} Products`);
    console.log("================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedDB();
