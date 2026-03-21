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
    url = f"https://graph.facebook.com/v21.0/{PAGE_ID}/posts"
    params = {
        'fields': 'message,link,created_time,id,full_picture',
        'access_token': TOKEN,
        'limit': 100,
        'since': since_timestamp
    }
    print(f"---- Starting Sync for Page ID: {PAGE_ID} ----")
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

            # ---- DEBUGGING PRINTS ----
            word_count = len(msg.split())
            has_emoji = "\U0001f7e5" in msg
            print(f"Checking Post {post_id}:")
            print(f"  - Word Count: {word_count}")
            print(f"  - Has emoji: {has_emoji}")

            # Filter: skip posts with less than 50 words or containing the red square emoji
            if word_count < 50 or has_emoji:
                print(f"  - SKIPPED (word_count={word_count}, has_emoji={has_emoji})")
                continue

            # Get image from full_picture field
            image_url = post.get('full_picture')
            print(f"  - Image URL: {image_url}")

            link = post.get('link', f"https://www.facebook.com/{post_id}")
            created = post.get('created_time', '')

            all_posts.append({
                'id': post_id,
                'message': msg,
                'link': link,
                'created_time': created,
                'image': image_url
            })

        # Handle pagination
        paging = data.get('paging', {})
        next_url = paging.get('next')
        url = next_url
        params = None  # params are already in the next URL

    return all_posts

def save_posts(posts):
    output_file = 'fb_posts.json'
    existing = []
    if os.path.exists(output_file):
        with open(output_file, 'r', encoding='utf-8') as f:
            existing = json.load(f)

    existing_ids = {p['id'] for p in existing}
    new_posts = [p for p in posts if p['id'] not in existing_ids]

    if new_posts:
        combined = new_posts + existing
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(combined, f, ensure_ascii=False, indent=2)
        print(f"---- Sync Complete. Total Articles Saved: {len(new_posts)} ----")
    else:
        print(f"---- Sync Complete. Total Articles Saved: 0 ----")

if __name__ == '__main__':
    posts = fetch_fb_posts()
    save_posts(posts)
