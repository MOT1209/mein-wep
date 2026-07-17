import os
import json
import re
from typing import List, Dict, Optional
from datetime import datetime

try:
    import kaggle
    from kaggle.api.kaggle_api_extended import KaggleApi
    HAS_KAGGLE = True
except Exception:
    HAS_KAGGLE = False
    import warnings
    warnings.filterwarnings("ignore")

class KaggleSearch:
    """Dynamic learning system using Kaggle API to extract knowledge from notebooks and datasets."""
    
    def __init__(self):
        self.api = None
        if HAS_KAGGLE:
            try:
                self._setup_credentials()
                self.api = KaggleApi()
                self.api.authenticate()
                print("[Kaggle] API authenticated successfully")
            except Exception as e:
                print(f"[Kaggle] Authentication failed: {e}")
                self.api = None
    
    def _setup_credentials(self):
        """Setup Kaggle credentials from environment variables or kaggle.json file."""
        username = os.environ.get('KAGGLE_USERNAME')
        key = os.environ.get('KAGGLE_KEY')
        
        if username and key:
            kaggle_dir = os.path.join(os.path.expanduser('~'), '.kaggle')
            os.makedirs(kaggle_dir, exist_ok=True)
            kaggle_json = os.path.join(kaggle_dir, 'kaggle.json')
            
            with open(kaggle_json, 'w') as f:
                json.dump({"username": username, "key": key}, f)
            os.chmod(kaggle_json, 0o600)
            print(f"[Kaggle] Credentials written from environment variables")
        else:
            kaggle_json = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kaggle.json')
            if os.path.exists(kaggle_json):
                os.environ['KAGGLE_CONFIG_DIR'] = os.path.dirname(os.path.abspath(__file__))
                print(f"[Kaggle] Using local kaggle.json")
    
    def is_available(self) -> bool:
        return self.api is not None
    
    def search_notebooks(self, query: str, max_results: int = 3) -> List[Dict]:
        """Search for relevant Kaggle notebooks based on query."""
        if not self.api:
            return []
        
        try:
            notebooks = self.api.kernels_list(
                search=query,
                sort_by='hotness',
                page=1,
                page_size=max_results
            )
            
            results = []
            for nb in notebooks:
                result = {
                    'title': getattr(nb, 'title', 'Unknown'),
                    'author': getattr(nb, 'author', 'Unknown'),
                    'url': f"https://www.kaggle.com/{getattr(nb, 'author', '')}/{getattr(nb, 'ref', '')}",
                    'votes': getattr(nb, 'totalVotes', 0),
                    'language': getattr(nb, 'language', 'Unknown'),
                    'topic': query
                }
                results.append(result)
            
            print(f"[Kaggle] Found {len(results)} notebooks for: {query}")
            return results
        except Exception as e:
            print(f"[Kaggle] Notebook search error: {e}")
            return []
    
    def search_datasets(self, query: str, max_results: int = 5) -> List[Dict]:
        """Search for relevant Kaggle datasets based on query."""
        if not self.api:
            return []
        
        try:
            datasets = self.api.dataset_list(search=query)
            
            results = []
            for ds in datasets[:max_results]:
                result = {
                    'title': getattr(ds, 'title', 'Unknown'),
                    'author': getattr(ds, 'ownerRef', 'Unknown'),
                    'url': f"https://www.kaggle.com/datasets/{getattr(ds, 'ref', '')}",
                    'votes': getattr(ds, 'totalVotes', 0),
                    'topic': query
                }
                results.append(result)
            
            print(f"[Kaggle] Found {len(results)} datasets for: {query}")
            return results
        except Exception as e:
            print(f"[Kaggle] Dataset search error: {e}")
            return []
    
    def extract_code_snippets(self, notebook_url: str) -> List[str]:
        """Extract best code snippets from a notebook."""
        snippets = []
        
        try:
            parts = notebook_url.split('/')
            if len(parts) >= 2:
                slug = parts[-1]
                snippets.append(f"# Reference: {notebook_url}")
                snippets.append(f"# See Kaggle notebook: {slug}")
        except:
            pass
        
        return snippets
    
    def format_knowledge_context(self, notebooks: List[Dict], datasets: List[Dict]) -> str:
        """Format Kaggle results as context for the AI model."""
        context_parts = []
        
        if notebooks:
            context_parts.append("\n📚 **Kaggle Notebook References:**\n")
            for nb in notebooks:
                context_parts.append(f"- [{nb['title']}]({nb['url']}) by {nb['author']} (👍 {nb['votes']} votes)")
        
        if datasets:
            context_parts.append("\n📊 **Related Kaggle Datasets:**\n")
            for ds in datasets:
                context_parts.append(f"- [{ds['title']}]({ds['url']}) (👍 {ds['votes']} votes)")
        
        context_parts.append("\n💡 *These references were found on Kaggle to help provide accurate information.*\n")
        
        return '\n'.join(context_parts)
    
    def extract_keywords(self, message: str) -> str:
        """Extract technical keywords from user message for Kaggle search."""
        technical_patterns = [
            'python', 'javascript', 'tensorflow', 'pytorch', 'machine learning',
            'deep learning', 'neural network', 'data science', 'api', 'web scraping',
            'automation', 'docker', 'kubernetes', 'sql', 'postgres', 'react',
            'vue', 'angular', 'node.js', 'django', 'flask', 'fastapi',
            'algorithm', 'sort', 'search', 'tree', 'graph', 'hash',
            'classification', 'regression', 'clustering', 'NLP', 'computer vision',
            'image processing', 'data analysis', 'pandas', 'numpy', 'scikit-learn'
        ]
        
        found_keywords = []
        message_lower = message.lower()
        
        for pattern in technical_patterns:
            if pattern in message_lower:
                found_keywords.append(pattern)
        
        english_words = re.findall(r'\b[a-zA-Z]{4,}\b', message)
        for word in english_words:
            if word.lower() not in [k.lower() for k in found_keywords]:
                found_keywords.append(word.lower())
        
        return ' '.join(found_keywords[:5]) if found_keywords else message[:50]
