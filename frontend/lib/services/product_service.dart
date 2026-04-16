import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product_model.dart';
import '../config/api_config.dart';

class ProductService {
  // Fetch semua produk
  static Future<List<ProductModel>> getProducts() async {
    try {
      final response = await http.get(Uri.parse(ApiConfig.products));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => ProductModel.fromJson(json)).toList();
      } else {
        throw Exception('Gagal ambil data produk: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Fetch produk by category
  static Future<List<ProductModel>> getProductsByCategory(String categoryId) async {
    try {
      final response = await http.get(Uri.parse(ApiConfig.products));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final all = data.map((json) => ProductModel.fromJson(json)).toList();
        return all
            .where((p) => p.category?.id == categoryId)
            .toList();
      } else {
        throw Exception('Gagal ambil data produk');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Fetch detail produk by ID
  static Future<ProductModel> getProductById(String id) async {
    try {
      final response = await http.get(Uri.parse('${ApiConfig.products}/$id'));

      if (response.statusCode == 200) {
        return ProductModel.fromJson(jsonDecode(response.body));
      } else {
        throw Exception('Produk tidak ditemukan');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}
