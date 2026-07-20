import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'provider_details_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  String _selectedPincode = '400001';
  String _selectedDietary = 'all';
  List<dynamic> _providers = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchProviders();
  }

  Future<void> _fetchProviders() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await ApiService.get(
        '/customers/discovery/search?pincode=$_selectedPincode&dietaryChoice=$_selectedDietary',
      );
      if (response.statusCode == 200) {
        setState(() {
          _providers = jsonDecode(response.body);
        });
      }
    } catch (e) {
      // Fallback mock data if backend unavailable
      setState(() {
        _providers = [
          {
            'id': 'prov-1',
            'businessName': 'Annapurna Kitchen',
            'rating': 4.8,
            'pincode': '400001',
            'dietaryChoices': ['veg', 'jain'],
            'description': 'Delicious home-style vegetarian thalis, pure ingredients, low oil.'
          },
          {
            'id': 'prov-2',
            'businessName': 'Grandmas Recipes',
            'rating': 4.6,
            'pincode': '400001',
            'dietaryChoices': ['veg', 'non-veg'],
            'description': 'Traditional non-veg curries and tiffins, authentic slow-cooked taste.'
          },
        ];
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // If navigation switch goes to profile
    if (_currentIndex == 1) {
      return const ProfileScreen();
    }

    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            const Icon(Icons.location_on, color: Color(0xFFF97316)),
            const SizedBox(width: 8),
            Text(
              'Mumbai - $_selectedPincode',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_location_alt_outlined, color: Colors.white70),
            onPressed: () => _showPincodeDialog(),
          ),
        ],
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF97316)))
          : RefreshIndicator(
              onRefresh: _fetchProviders,
              color: const Color(0xFFF97316),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Banner Card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF854D0E), Color(0xFFB45309)],
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'Daily Fresh Dabbas',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                SizedBox(height: 8),
                                Text(
                                  'Discover home-style tiffin kitchens in your locality.',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Text('🍲', style: TextStyle(fontSize: 48)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Filter tags
                    const Text(
                      'Dietary Choice',
                      style: TextStyle(color: Color(0xFFCBD5E1), fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _buildFilterChip('all', 'All Food'),
                        _buildFilterChip('veg', 'Veg Only'),
                        _buildFilterChip('non-veg', 'Non-Veg'),
                        _buildFilterChip('jain', 'Jain'),
                      ].map((w) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: w,
                      )).toList(),
                    ),
                    const SizedBox(height: 24),

                    // Provider Kitchen Header
                    const Text(
                      'Popular Tiffin Kitchens',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    const SizedBox(height: 12),

                    // Providers List
                    if (_providers.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 40),
                          child: Text(
                            'No kitchens found serving this area.',
                            style: TextStyle(color: Color(0xFF64748B)),
                          ),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _providers.length,
                        itemBuilder: (context, index) {
                          final p = _providers[index];
                          return Card(
                            color: const Color(0xFF0F172A),
                            margin: const EdgeInsets.only(bottom: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: const BorderSide(color: Colors.white10),
                            ),
                            child: InkWell(
                              onTap: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ProviderDetailsScreen(provider: p),
                                ),
                              ),
                              borderRadius: BorderRadius.circular(16),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          p['businessName'] ?? 'Tiffin Provider',
                                          style: const TextStyle(
                                            fontSize: 17,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: Colors.orange.withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Row(
                                            children: [
                                              const Icon(Icons.star, color: Colors.orange, size: 14),
                                              const SizedBox(width: 4),
                                              Text(
                                                '${p['rating'] ?? 4.5}',
                                                style: const TextStyle(
                                                  color: Colors.orange,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      p['description'] ?? 'Delicious home-style food thalis.',
                                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                    ),
                                    const SizedBox(height: 16),
                                    Row(
                                      children: [
                                        const Icon(Icons.electric_bike_outlined, color: Color(0xFF64748B), size: 16),
                                        const SizedBox(width: 6),
                                        const Text('Free Delivery', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                                        const Spacer(),
                                        // Dietary dots
                                        Wrap(
                                          spacing: 6,
                                          children: (p['dietaryChoices'] as List<dynamic>? ?? ['veg'])
                                              .map<Widget>((choice) => Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: choice == 'veg'
                                                          ? const Color(0xFF10B981).withOpacity(0.1)
                                                          : choice == 'jain'
                                                              ? Colors.purple.withOpacity(0.1)
                                                              : Colors.red.withOpacity(0.1),
                                                      borderRadius: BorderRadius.circular(6),
                                                    ),
                                                    child: Text(
                                                      choice.toString().toUpperCase(),
                                                      style: TextStyle(
                                                        color: choice == 'veg'
                                                            ? const Color(0xFF10B981)
                                                            : choice == 'jain'
                                                                ? Colors.purple
                                                                : Colors.red,
                                                        fontSize: 9,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                  ))
                                              .toList(),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF0F172A),
        selectedItemColor: const Color(0xFFF97316),
        unselectedItemColor: const Color(0xFF64748B),
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Discover'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String val, String title) {
    final active = _selectedDietary == val;
    return ChoiceChip(
      selected: active,
      label: Text(title),
      selectedColor: const Color(0xFFF97316),
      disabledColor: const Color(0xFF1E293B),
      labelStyle: TextStyle(
        color: active ? Colors.white : const Color(0xFFCBD5E1),
        fontWeight: FontWeight.w600,
        fontSize: 12,
      ),
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedDietary = val;
          });
          _fetchProviders();
        }
      },
    );
  }

  void _showPincodeDialog() {
    final controller = TextEditingController(text: _selectedPincode);
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0F172A),
          title: const Text('Change Location Pincode', style: TextStyle(color: Colors.white)),
          content: TextField(
            controller: controller,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              hintText: 'e.g. 400001',
              hintStyle: TextStyle(color: Color(0xFF64748B)),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
            ),
            TextButton(
              onPressed: () {
                if (controller.text.isNotEmpty) {
                  setState(() {
                    _selectedPincode = controller.text;
                  });
                  _fetchProviders();
                }
                Navigator.pop(context);
              },
              child: const Text('Update', style: TextStyle(color: Color(0xFFF97316))),
            ),
          ],
        );
      },
    );
  }
}
