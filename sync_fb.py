import requests
import json
import os
from datetime import datetime, timezone

# Configuration
TOKEN = os.getenv('FB_PAGE_TOKEN')
PAGE_ID = '893376663850463'  # MCT Facebook Page ID
SINCE_DATE = '2026-03-13'  # Fetch articles from this date onwards

def fetch_fb_posts():
    filtered_articles = []
    # Use pagination to get ALL posts since March 13
    since_timestamp = int(datetime.strptime(SINCE_DATE, '%Y-%m-%d').replace(tzinfo=timezone.utc).timestamp())
    url = f"https://graph.facebook.com/v21.0/{PAGE_ID}/feed?fields=message,full_picture,link,created_time,id&access_token={TOKEN}&limit=100&since={since_timestamp}"

    while url:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Error fetching from Facebook: {response.text}")
            break

        data = response.json()
        raw_data = data.get('data', [])

        for post in raw_data:
            message = post.get('message', '')

            # RULE 1: Check for the Red Square Emoji
            if "\U0001f7e5" not in message:
                continue

            # RULE 2: Word Count Filter (> 500 words)
            words = message.split()
            if len(words) <= 500:
                continue

            # Extract Metadata
            lines = message.strip().split('\n')
            title = lines[0].replace('\U0001f7e5', '').strip()

            raw_date = post.get('created_time', '')
            formatted_date = ""
            if raw_date:
                dt = datetime.strptime(raw_date, '%Y-%m-%dT%H:%M:%S%z')
                formatted_date = dt.strftime('%B %d, %Y')

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

        # Follow pagination to get older posts
        paging = data.get('paging', {})
        url = paging.get('next', None)

    # Save the filtered articles to fb_posts.json
    with open('fb_posts.json', 'w', encoding='utf-8') as f:
        json.dump(filtered_articles, f, ensure_ascii=False, indent=4)
    print(f"Successfully synced {len(filtered_articles)} articles.")

if __name__ == "__main__":
    fetch_fb_posts()
