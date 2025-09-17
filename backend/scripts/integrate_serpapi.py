import requests
import json
import os
from datetime import datetime

class SerpAPIIntegration:
    def __init__(self):
        self.api_key = "c9a1a6262d785b2ab31ea1d2fe5784594c55ae4efc925a4a5054e7cd5d6e0795"
        self.base_url = "https://serpapi.com/search.json"
    
    def search_nearby_places(self, lat, lon, query="posto de gasolina", radius="5km"):
        """Search for places near the given coordinates using SerpAPI"""
        try:
            params = {
                "engine": "google_maps",
                "q": query,
                "ll": f"@{lat},{lon},14z",
                "api_key": self.api_key
            }
            
            response = requests.get(self.base_url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                return self.process_results(data)
            else:
                print(f"API request failed with status: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Error searching places: {e}")
            return None
    
    def process_results(self, data):
        """Process SerpAPI results for motorcyclist needs"""
        processed = {
            "places": [],
            "timestamp": datetime.now().isoformat(),
            "search_info": data.get("search_metadata", {})
        }
        
        if "local_results" in data:
            for place in data["local_results"]:
                processed_place = {
                    "name": place.get("title", ""),
                    "address": place.get("address", ""),
                    "rating": place.get("rating", 0),
                    "type": place.get("type", ""),
                    "coordinates": place.get("gps_coordinates", {}),
                    "distance": place.get("distance", ""),
                    "phone": place.get("phone", ""),
                    "hours": place.get("hours", ""),
                    "price": place.get("price", ""),
                    # Motorcyclist-specific flags
                    "motorcycle_friendly": self.is_motorcycle_friendly(place),
                    "has_covered_area": self.has_covered_area(place),
                    "emergency_service": self.is_emergency_service(place)
                }
                processed["places"].append(processed_place)
        
        return processed
    
    def is_motorcycle_friendly(self, place):
        """Determine if a place is motorcycle-friendly"""
        title = place.get("title", "").lower()
        type_info = place.get("type", "").lower()
        
        motorcycle_keywords = [
            "posto", "gas station", "oficina", "borracharia", 
            "moto", "motorcycle", "repair", "tire"
        ]
        
        return any(keyword in title or keyword in type_info for keyword in motorcycle_keywords)
    
    def has_covered_area(self, place):
        """Check if place has covered area (good for rain protection)"""
        title = place.get("title", "").lower()
        return "posto" in title or "shopping" in title or "coberto" in title
    
    def is_emergency_service(self, place):
        """Check if place offers emergency services"""
        title = place.get("title", "").lower()
        type_info = place.get("type", "").lower()
        
        emergency_keywords = ["24h", "24 horas", "emergency", "hospital", "oficina"]
        return any(keyword in title or keyword in type_info for keyword in emergency_keywords)

# Test the integration
if __name__ == "__main__":
    api = SerpAPIIntegration()
    
    # Test with São Paulo coordinates
    results = api.search_nearby_places(-23.5505, -46.6333, "posto de gasolina")
    
    if results:
        print(f"Found {len(results['places'])} places:")
        for place in results['places'][:3]:  # Show first 3 results
            print(f"- {place['name']}: {place['address']}")
            print(f"  Rating: {place['rating']}, Motorcycle friendly: {place['motorcycle_friendly']}")
            print()
    else:
        print("Failed to fetch places data")
