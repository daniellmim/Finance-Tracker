String suggestCategory(String text, List<String> categories) {
  final lower = text.toLowerCase();
  final rules = <String, List<String>>{
    'Groceries': ['grocery', 'market', 'supermarket', 'food'],
    'Dining Out': [
      'coffee',
      'restaurant',
      'cafe',
      'dinner',
      'lunch',
      'breakfast',
      'snack',
    ],
    'Transport': [
      'uber',
      'lyft',
      'bus',
      'train',
      'taxi',
      'gas',
      'fuel',
      'metro',
    ],
    'Shopping': ['amazon', 'shop', 'store', 'clothes', 'shoes', 'electronics'],
    'Utilities': ['rent', 'electric', 'water', 'internet', 'phone', 'utility'],
    'Entertainment': ['movie', 'netflix', 'game', 'concert', 'music'],
    'Health': ['pharmacy', 'doctor', 'clinic', 'medicine', 'gym'],
    'Travel': ['flight', 'hotel', 'airbnb', 'trip', 'vacation'],
    'Gift': ['gift', 'present', 'birthday'],
    'Personal Care': ['salon', 'spa', 'haircut', 'beauty'],
  };

  for (final entry in rules.entries) {
    if (!categories.contains(entry.key)) continue;
    for (final keyword in entry.value) {
      if (lower.contains(keyword)) return entry.key;
    }
  }

  return categories.isNotEmpty ? categories.first : 'General';
}
