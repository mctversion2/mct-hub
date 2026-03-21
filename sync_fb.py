import requests
import json
import os
from datetime import datetime

# Configuration
TOKEN = os.getenv('FB_PAGE_TOKEN')
PAGE_ID = 'me'

def fetch_fb_posts():
    # We fetch the last 50 posts to make sure we find enough that meet your 500-word rule
    url = f"https://graph.facebook.com/v21.0/{PAGE_ID}/feed?fields=message,full_picture,link,created_time,id&access_token={TOKEN}&limit=50"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error fetching from Facebook: {response.text}")
        return

    raw_data = response.json().get('data', [])
    filtered_articles = []

    for post in raw_data:
        message = post.get('message', '')

        # RULE 1: Check for the Red Square Emoji
        if "\U0001f7e5" not in message:
            continue

        # RULE 2: Word Count Filter (> 500 words)
        words = message.split()
        if len(words) <= 500:
            continue

        # RULE 3 & 4: Extract Metadata
        # We take the first line as the Title
        lines = message.strip().split('\n')
        title = lines[0].replace('\U0001f7e5', '').strip()

        # Format the date to be more readable
        raw_date = post.get('created_time', '')
        formatted_date = ""
        if raw_date:
            dt = datetime.strptime(raw_date, '%Y-%m-%dT%H:%M:%S%z')
            formatted_date = dt.strftime('%B %d, %Y')

        # Build the clean article object
        article = {
            "id": post.get('id'),
            "title": title,
            "date": formatted_date,
            "content": message,
            "image": post.get('full_picture'),
            "link": post.get('link'),
            "word_count": len(words)
        }
        filtered_articles.append(article)
        print(f"Accepted Article: {title} ({len(words)} words)")

    # Save the filtered articles to fb_posts.json
    with open('fb_posts.json', 'w', encoding='utf-8') as f:
        json.dump(filtered_articles, f, ensure_ascii=False, indent=4)
    print(f"Successfully synced {len(filtered_articles)} articles.")

if __name__ == "__main__":
    fetch_fb_posts()
