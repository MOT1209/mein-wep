import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

class ReelsPage extends StatefulWidget {
  const ReelsPage({super.key});

  @override
  State<ReelsPage> createState() => _ReelsPageState();
}

class _ReelsPageState extends State<ReelsPage> {
  final PageController _pageController = PageController();

  // Dummy data representing reels from Supabase
  final List<Map<String, String>> reelsData = [
    {
      'videoUrl':
          'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4',
      'title': 'سورة الكهف - آية ١٠',
      'tags': '#قرآن #طمأنينة',
    },
    {
      'videoUrl':
          'https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4',
      'title': 'سورة الرحمن - آية ١',
      'tags': '#تلاوة #راحة_نفسية #القرآن',
    },
    {
      'videoUrl':
          'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4',
      'title': 'أنشودة: أشرق النور',
      'tags': '#أناشيد #إسلاميات',
    },
    {
      'videoUrl':
          'https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4',
      'title': 'سورة يوسف - آية ٨٦',
      'tags': '#حزن #دعاء',
    },
    {
      'videoUrl':
          'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4',
      'title': 'أنشودة: رحمن يا رحمن',
      'tags': '#مشاري_العفاسي #أناشيد',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        scrollDirection: Axis.vertical,
        controller: _pageController,
        itemCount: reelsData.length,
        itemBuilder: (context, index) {
          final reel = reelsData[index];
          return ReelPlayerItem(
            videoUrl: reel['videoUrl']!,
            title: reel['title']!,
            tags: reel['tags']!,
          );
        },
      ),
    );
  }
}

class ReelPlayerItem extends StatefulWidget {
  final String videoUrl;
  final String title;
  final String tags;

  const ReelPlayerItem({
    super.key,
    required this.videoUrl,
    required this.title,
    required this.tags,
  });

  @override
  State<ReelPlayerItem> createState() => _ReelPlayerItemState();
}

class _ReelPlayerItemState extends State<ReelPlayerItem> {
  late VideoPlayerController _controller;
  bool _isPlaying = true;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl))
      ..initialize().then((_) {
        setState(() {});
        _controller.play();
        _controller.setLooping(true);
      });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _togglePlayPause() {
    setState(() {
      if (_controller.value.isPlaying) {
        _controller.pause();
        _isPlaying = false;
      } else {
        _controller.play();
        _isPlaying = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _togglePlayPause,
      child: Stack(
        fit: StackFit.expand,
        children: [
          _controller.value.isInitialized
              ? FittedBox(
                  fit: BoxFit.cover,
                  child: SizedBox(
                    width: _controller.value.size.width,
                    height: _controller.value.size.height,
                    child: VideoPlayer(_controller),
                  ),
                )
              : const Center(
                  child: CircularProgressIndicator(color: Colors.teal),
                ),

          if (!_isPlaying)
            const Center(
              child: Icon(
                Icons.play_arrow_rounded,
                size: 80,
                color: Colors.white54,
              ),
            ),

          // Floating UI Overlay
          Positioned(
            bottom: 40,
            right: 16, // UI on the right for RTL layout naturally
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  widget.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    shadows: [Shadow(blurRadius: 10, color: Colors.black)],
                  ),
                  textDirection: TextDirection.rtl,
                ),
                const SizedBox(height: 8),
                Text(
                  widget.tags,
                  style: const TextStyle(
                    color: Colors.white70,
                    shadows: [Shadow(blurRadius: 10, color: Colors.black)],
                  ),
                  textDirection: TextDirection.rtl,
                ),
              ],
            ),
          ),

          // Action Buttons
          Positioned(
            bottom: 40,
            left: 16,
            child: Column(
              children: [
                _buildActionButton(Icons.favorite_border, 'إعجاب'),
                const SizedBox(height: 16),
                _buildActionButton(Icons.comment_outlined, 'تعليق'),
                const SizedBox(height: 16),
                _buildActionButton(Icons.share_outlined, 'مشاركة'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 36),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
      ],
    );
  }
}
