import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';
import 'screens/order_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Admin Web Noesantara',
      debugShowCheckedModeBanner: false, // Menghilangkan pita "DEBUG" di pojok kanan atas
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.red),
        useMaterial3: true, 
      ),
      home: const MainLayout(),
    );
  }
}

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0; // Indeks halaman yang sedang aktif

  // Daftar halaman yang dihubungkan ke menu Sidebar
  final List<Widget> _screens = [
    const DashboardScreen(), // Index 0: Halaman Kelola Menu (CRUD)
    const OrderScreen(),     // Index 1: Halaman Pesanan Masuk
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // PANEL SAMPING (SIDEBAR NAVIGASI)
          NavigationRail(
            backgroundColor: Colors.red[900], // Sesuai dengan tema Noesantara
            selectedIndex: _selectedIndex,
            extended: true, // Membuat sidebar melebar (memunculkan teks label)
            unselectedIconTheme: const IconThemeData(color: Colors.white70),
            selectedIconTheme: const IconThemeData(color: Colors.white, size: 30),
            unselectedLabelTextStyle: const TextStyle(color: Colors.white70),
            selectedLabelTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            onDestinationSelected: (int index) {
              setState(() {
                _selectedIndex = index; // Mengganti halaman yang aktif saat diklik
              });
            },
            leading: const Padding(
              padding: EdgeInsets.symmetric(vertical: 30, horizontal: 10),
              child: Text(
                "NOESANTARA\nADMIN PANEL",
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white, 
                  fontSize: 18, 
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
            ),
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.restaurant_menu),
                label: Text('Kelola Menu'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.shopping_cart),
                label: Text('Pesanan Masuk'),
              ),
            ],
          ),
          
          // GARIS PEMISAH ANTARA SIDEBAR DAN KONTEN
          const VerticalDivider(thickness: 1, width: 1),

          // AREA KONTEN UTAMA
          Expanded(
            child: Container(
              color: Colors.grey[50], // Background agak abu-abu agar tabel lebih menonjol
              child: _screens[_selectedIndex], // Memanggil layar sesuai menu yang dipilih
            ),
          ),
        ],
      ),
    );
  }
}