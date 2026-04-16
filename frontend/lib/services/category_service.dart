import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/category_model.dart';
import '../config/api_config.dart';

class CategoryService {
  // Fetch semua categories
  static Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await http.get(Uri.parse(ApiConfig.categories));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => CategoryModel.fromJson(json)).toList();
      } else {
        throw Exception('Gagal ambil data kategori: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}
