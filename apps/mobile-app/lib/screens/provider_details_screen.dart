import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ProviderDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> provider;
  const ProviderDetailsScreen({Key? key, required this.provider}) : super(key: key);

  @override
  State<ProviderDetailsScreen> createState() => _ProviderDetailsScreenState();
}

class _ProviderDetailsScreenState extends State<ProviderDetailsScreen> {
  String _selectedDuration = 'Monthly'; // Daily, Weekly, Monthly
  bool _isLoading = false;

  void _handleSubscribe() async {
    setState(() {
      _isLoading = true;
    });

    // Generate mock order/subscription load
    try {
      await ApiService.post('/payments/checkout', {
        'providerId': widget.provider['id'],
        'amount': _selectedDuration == 'Monthly'
            ? 3500
            : _selectedDuration == 'Weekly'
                ? 900
                : 150,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Checkout payment initiated! Subscription order logged successfully.'),
            backgroundColor: const Color(0xFF10B981),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      // Fallback
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Mock Subscription Created! Enjoy your meals!'),
            backgroundColor: const Color(0xFF10B981),
          ),
        );
        Navigator.pop(context);
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Text(widget.provider['businessName'] ?? 'Kitchen Details'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Details Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('🍳', style: TextStyle(fontSize: 32)),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.provider['businessName'] ?? 'Annapurna Kitchen',
                            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.star, color: Colors.orange, size: 16),
                              const SizedBox(width: 4),
                              Text(
                                '${widget.provider['rating'] ?? 4.8}',
                                style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    widget.provider['description'] ?? 'Traditional home-cooked healthy meals prepared daily with organic components.',
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Select Subscription Plan',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
            ),
            const SizedBox(height: 12),

            // Durations Selector Cards
            Row(
              children: [
                _buildPlanDurationCard('Daily', '₹150', 'Trial Day'),
                const SizedBox(width: 12),
                _buildPlanDurationCard('Weekly', '₹900', '7 Days pack'),
                const SizedBox(width: 12),
                _buildPlanDurationCard('Monthly', '₹3500', 'Best Value'),
              ],
            ),
            const SizedBox(height: 24),

            const Text(
              'Active Menu Items',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
            ),
            const SizedBox(height: 12),

            // Mock Menu List
            ListView(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildMenuItem('Premium Veg Thali', 'Dal, Paneer Masala, 4 Rotis, Rice, Sweet', 'veg', '550 kcal'),
                _buildMenuItem('Special Jain Khichdi thali', 'Khichdi, Kadhi, Aloo Jeera, Salad', 'jain', '390 kcal'),
                _buildMenuItem('Homestyle Chicken Thali', 'Chicken Curry, Raita, 3 Chapatis, Pulao', 'non-veg', '680 kcal'),
              ],
            ),
            const SizedBox(height: 40),

            _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFF97316)))
                : SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: _handleSubscribe,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF97316),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: Text(
                        'Subscribe $_selectedDuration Pack',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlanDurationCard(String duration, String price, String subtitle) {
    final active = _selectedDuration == duration;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedDuration = duration;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          decoration: BoxDecoration(
            color: active ? const Color(0xFFF97316).withOpacity(0.1) : const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: active ? const Color(0xFFF97316) : Colors.white10,
            ),
          ),
          child: Column(
            children: [
              Text(
                duration,
                style: TextStyle(
                  color: active ? const Color(0xFFF97316) : Colors.white70,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                price,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem(String name, String desc, String type, String calories) {
    return Card(
      color: const Color(0xFF0F172A),
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Colors.white10),
      ),
      child: ListTile(
        leading: Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: type == 'veg'
                ? const Color(0xFF10B981)
                : type == 'jain'
                    ? Colors.purple
                    : Colors.red,
          ),
        ),
        title: Text(name, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
            const SizedBox(height: 2),
            Text(calories, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10)),
          ],
        ),
        trailing: const Icon(Icons.check_circle_outline, color: Color(0xFF475569)),
      ),
    );
  }
}
