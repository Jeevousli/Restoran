import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../models/order.dart';

class ApiService {
  // Ganti localhost dengan IP lokal komputer jika diakses dari perangkat lain
  static const String baseUrl = 'http://localhost:3000/api/products';
  static const String orderUrl = 'http://localhost:3000/api/orders';

  // [READ] Mengambil daftar menu
  Future<List<Product>> fetchProducts() async {
    final response = await http.get(Uri.parse(baseUrl));
    if (response.statusCode == 200) {
      List jsonResponse = json.decode(response.body);
      return jsonResponse.map((data) => Product.fromJson(data)).toList();
    } else {
      throw Exception('Gagal memuat produk');
    }
  }

  // [CREATE] Menambah menu baru
  Future<void> createProduct(String name, int price, String categoryId) async {
    await http.post(
      Uri.parse(baseUrl),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'name': name,
        'price': price,
        'category_id': categoryId,
        'image_url': 'https://via.placeholder.com/150', // Gambar dummy sementara
      }),
    );
  }

  // [DELETE] Menghapus menu
  Future<void> deleteProduct(String id) async {
    await http.delete(Uri.parse('$baseUrl/$id'));
  }


  Future<void> updateProduct(String id, String name, int price) async {
    final response = await http.put(
      Uri.parse('$baseUrl/$id'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'name': name,
        'price': price,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal memperbarui produk');
    }
  }

  Future<List<Order>> fetchOrders() async {
    final response = await http.get(Uri.parse(orderUrl));
    if (response.statusCode == 200) {
      List jsonResponse = json.decode(response.body);
      return jsonResponse.map((data) => Order.fromJson(data)).toList();
    } else {
      throw Exception('Gagal memuat pesanan');
    }
  }

  // Memperbarui status pesanan
  Future<void> updateOrderStatus(String id, String newStatus) async {
    final response = await http.put(
      Uri.parse('$orderUrl/$id/status'), // Sesuaikan dengan route Node.js Anda
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'status': newStatus}),
    );

    if (response.statusCode != 200) {
      throw Exception('Gagal mengupdate status pesanan');
    }
  }
}