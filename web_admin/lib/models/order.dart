class Order {
  final String id;
  final String customerName; // Asumsi ada nama pemesan atau ID User
  final int totalPrice;
  final String status;       // Contoh status: 'Pending', 'Diproses', 'Selesai'
  final String orderDate;

  Order({
    required this.id,
    required this.customerName,
    required this.totalPrice,
    required this.status,
    required this.orderDate,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'] ?? '',
      customerName: json['user_id']?['name'] ?? 'Pelanggan', 
      totalPrice: json['total_price'] ?? 0,
      status: json['status'] ?? 'Pending',
      orderDate: json['createdAt'] ?? '',
    );
  }
}