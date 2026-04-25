import 'package:flutter/material.dart';
import '../models/order.dart';
import '../services/api_service.dart';

class OrderScreen extends StatefulWidget {
  const OrderScreen({super.key});

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  final ApiService apiService = ApiService();
  late Future<List<Order>> _ordersFuture;

  @override
  void initState() {
    super.initState();
    _refreshOrders();
  }

  void _refreshOrders() {
    setState(() {
      _ordersFuture = apiService.fetchOrders();
    });
  }

  // Warna badge status agar UI Admin lebih intuitif
  Color _getStatusColor(String status) {
    if (status.toLowerCase() == 'pending') return Colors.orange;
    if (status.toLowerCase() == 'diproses') return Colors.blue;
    if (status.toLowerCase() == 'selesai') return Colors.green;
    return Colors.grey;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pesanan Masuk', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.red[900],
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _refreshOrders,
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: FutureBuilder<List<Order>>(
          future: _ordersFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text("Error: ${snapshot.error}"));
            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return const Center(child: Text("Belum ada pesanan masuk."));
            }

            final orders = snapshot.data!;

            return SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: SizedBox(
                width: double.infinity,
                child: DataTable(
                  headingRowColor: MaterialStateProperty.all(Colors.grey[200]),
                  columns: const [
                    DataColumn(label: Text('ID PESANAN', style: TextStyle(fontWeight: FontWeight.bold))),
                    DataColumn(label: Text('PELANGGAN', style: TextStyle(fontWeight: FontWeight.bold))),
                    DataColumn(label: Text('TOTAL', style: TextStyle(fontWeight: FontWeight.bold))),
                    DataColumn(label: Text('STATUS', style: TextStyle(fontWeight: FontWeight.bold))),
                    DataColumn(label: Text('AKSI', style: TextStyle(fontWeight: FontWeight.bold))),
                  ],
                  rows: orders.map((order) {
                    return DataRow(cells: [
                      DataCell(Text(order.id.substring(order.id.length - 6))), // Tampilkan 6 digit terakhir saja
                      DataCell(Text(order.customerName)),
                      DataCell(Text('Rp ${order.totalPrice}')),
                      DataCell(
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: _getStatusColor(order.status).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(order.status, style: TextStyle(color: _getStatusColor(order.status), fontWeight: FontWeight.bold)),
                        ),
                      ),
                      DataCell(
                        // Dropdown untuk langsung merubah status di tabel
                        DropdownButton<String>(
                          value: order.status,
                          items: <String>['Pending', 'Diproses', 'Selesai'].map((String value) {
                            return DropdownMenuItem<String>(
                              value: value,
                              child: Text(value),
                            );
                          }).toList(),
                          onChanged: (String? newValue) async {
                            if (newValue != null && newValue != order.status) {
                              await apiService.updateOrderStatus(order.id, newValue);
                              _refreshOrders(); // Refresh setelah diubah
                            }
                          },
                        ),
                      ),
                    ]);
                  }).toList(),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}