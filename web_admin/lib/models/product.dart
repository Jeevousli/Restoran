class Product {
  final String id;
  final String name;
  final int price;
  final String imageUrl;

  Product({required this.id, required this.name, required this.price, required this.imageUrl});

  // Fungsi untuk mengubah JSON dari Node.js menjadi Objek Dart
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'] ?? '', 
      name: json['name'] ?? '',
      price: json['price'] ?? 0,
      imageUrl: json['image_url'] ?? '',
    );
  }
}