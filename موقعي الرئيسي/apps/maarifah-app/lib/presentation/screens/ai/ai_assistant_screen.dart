import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/services/ai_service.dart';
import '../../../core/theme/app_colors.dart';

class _ChatMsg {
  _ChatMsg(this.text, this.isUser);
  final String text;
  final bool isUser;
}

/// شاشة المساعد الذكي (AI Assistant).
class AiAssistantScreen extends StatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  State<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends State<AiAssistantScreen> {
  final _controller = TextEditingController();
  final _scroll = ScrollController();
  final List<_ChatMsg> _messages = [
    _ChatMsg('مرحباً! أنا مساعد معرفة الذكي 🤖\nاسألني عن البرمجة، الذكاء الاصطناعي، أو الدورات.', false),
  ];
  bool _typing = false;

  late final AiService _ai = context.read<AiService>();

  final _suggestions = const ['ما هو الذكاء الاصطناعي؟', 'كيف أبدأ بايثون؟', 'كيف أكسب النقاط؟'];

  Future<void> _send([String? preset]) async {
    final text = (preset ?? _controller.text).trim();
    if (text.isEmpty) return;
    _controller.clear();
    setState(() {
      _messages.add(_ChatMsg(text, true));
      _typing = true;
    });
    _scrollDown();
    final reply = await _ai.chat(text);
    if (!mounted) return;
    setState(() {
      _typing = false;
      _messages.add(_ChatMsg(reply, false));
    });
    _scrollDown();
  }

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            CircleAvatar(backgroundColor: AppColors.secondary, child: Icon(Icons.auto_awesome, color: Colors.white, size: 18)),
            SizedBox(width: 8),
            Text('المساعد الذكي'),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scroll,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_typing ? 1 : 0),
              itemBuilder: (_, i) {
                if (_typing && i == _messages.length) {
                  return const _Bubble(text: '...', isUser: false);
                }
                final m = _messages[i];
                return _Bubble(text: m.text, isUser: m.isUser);
              },
            ),
          ),
          if (_messages.length <= 1)
            SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: _suggestions
                    .map((s) => Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ActionChip(label: Text(s), onPressed: () => _send(s)),
                        ))
                    .toList(),
              ),
            ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(hintText: 'اكتب سؤالك...'),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    style: IconButton.styleFrom(backgroundColor: AppColors.secondary),
                    icon: const Icon(Icons.send),
                    onPressed: () => _send(),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.text, required this.isUser});
  final String text;
  final bool isUser;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isUser ? AlignmentDirectional.centerStart : AlignmentDirectional.centerEnd,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: isUser ? null : Border.all(color: AppColors.lightBorder),
        ),
        child: Text(text, style: TextStyle(color: isUser ? Colors.white : null, height: 1.5)),
      ),
    );
  }
}
