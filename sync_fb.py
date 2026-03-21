import requests
import json
import os
from datetime import datetime

# Configuration
TOKEN = os.getenv('FB_PAGE_TOKEN')
PAGE_ID = '893376663850463'
SINCE_DATE = "2026-03-13"  # The date the site froze

def fetch_fb_posts():
    # Convert date to timestamp for Facebook
    since_timestamp = int(datetime.strptime(SINCE_DATE, "%Y-%m-%d").timestamp())
    url = f"https://graph.facebook.com/v21.0/{PAGE_ID}/feed"
    params = {
        'fields': 'message,full_picture,link,created_time,id',
        'access_token': TOKEN,
        'limit': 100,
        'since': since_timestamp
    }
    print(f"--- Starting Sync for Page ID: {PAGE_ID} ---")
    all_posts = []

    # Pagination Loop
    while url:
        response = requests.get(url, params=params if '?' not in url else None)
        if response.status_code != 200:
            print(f"!! CRITICAL ERROR: Facebook API returned {response.status_code}")
            print(f"!! Response Body: {response.text}")
            break

        data = response.json()
        posts = data.get('data', [])
        print(f"Found {len(posts)} raw posts in this batch...")

        for post in posts:
            msg = post.get('message', '')
            post_id = post.get('id')

            # --- DEBUGGING PRINTS ---
            word_count = len(msg.split())
            has_emoji = "\U0001f7e5" in msg
            print(f"Checking Post {post_id}:")
            print(f" - Word Count: {word_count}")
            print(f" - Has emoji: {has_emoji}")

            # APPLY FILTERS
            if not has_emoji:
                print(" - [SKIP] No red square emoji found.")
                continue

            if word_count <= 500:
                print(f" - [SKIP] Only {word_count} words (Need > 500).")
                continue

            # If it passes, process it
            lines = msg.strip().split('\n')
            title = lines[0].replace('\U0001f7e5', '').strip()
            all_posts.append({
                "id": post_id,
                "title": title,
                "date": post.get('created_time'),
                "content": msg,
                "image": post.get('full_picture'),
                "link": post.get('link')
            })
            print(f" - [SUCCESS] Added Article: {title}")

        # Check for next page
        url = data.get('paging', {}).get('next')
        params = {}  # Clear params for the next URL

    # Save results
    with open('fb_posts.json', 'w', encoding='utf-8') as f:
        json.dump(all_posts, f, ensure_ascii=False, indent=4)
    print(f"--- Sync Complete. Total Articles Saved: {len(all_posts)} ---")

if __name__ == "__main__":
    fetch_fb_posts()
