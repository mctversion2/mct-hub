import requests
import json
import os
from datetime import datetime

# Configuration
TOKEN = os.getenv('FB_PAGE_TOKEN')
PAGE_ID = '893376663850463'
SINCE_DATE = "2026-03-13"  # The date the site froze
IMG_DIR = 'img'

def download_image(image_url, post_id):
    """Download image from Facebook CDN and save locally. Returns local path or None."""
    if not image_url:
        return None
    os.makedirs(IMG_DIR, exist_ok=True)
    safe_id = post_id.replace('_', '-')
    local_path = f"{IMG_DIR}/fb-{safe_id}.jpg"
    if os.path.exists(local_path):
        print(f"   - Image already exists: {local_path}")
        return local_path
    try:
        response = requests.get(image_url, timeout=15)
        if response.status_code == 200:
            with open(local_path, 'wb') as f:
                f.write(response.content)
            print(f"   - Image downloaded: {local_path}")
            return local_path
        else:
            print(f"   - Image download failed (HTTP {response.status_code})")
            return None
    except Exception as e:
        print(f"   - Image download error: {e}")
        return None

def migrate_existing_images():
    """One-time migration: for all posts in fb_posts.json that still have
    a CDN URL (or null) as image, try to download the image and update
    the record to point to the local path instead."""
    output_file = 'fb_posts.json'
    if not os.path.exists(output_file):
        return
    with open(output_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)
    changed = 0
    for post in posts:
        post_id = post.get('id', '')
        current_image = post.get('image')
        safe_id = post_id.replace('_', '-')
        local_path = f"{IMG_DIR}/fb-{safe_id}.jpg"
        # If local file already exists, just make sure the record points to it
        if os.path.exists(local_path):
            if post.get('image') != local_path:
                post['image'] = local_path
                changed += 1
        elif current_image and current_image.startswith('http'):
            # Still has a CDN URL — try to download it now
            result = download_image(current_image, post_id)
            if result:
                post['image'] = result
                changed += 1
    if changed > 0:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(posts, f, ensure_ascii=False, indent=2)
        print(f"---- Migration: Updated {changed} existing post image paths ----")
    else:
        print("---- Migration: No image paths needed updating ----")

def fetch_fb_posts():
    since_timestamp = int(datetime.strptime(SINCE_DATE, "%Y-%m-%d").timestamp())
    url = f"https://graph.facebook.com/v21.0/{PAGE_ID}/posts"
    params = {
        'fields': 'message,created_time,id,full_picture',
        'access_token': TOKEN,
        'limit': 100,
        'since': since_timestamp
    }
    print(f"---- Starting Sync for Page ID: {PAGE_ID} ----")
    all_posts = []
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
            word_count = len(msg.split())
            has_emoji = "\U0001f7e5" in msg
            print(f"Checking Post {post_id}:")
            print(f"  - Word Count: {word_count}")
            print(f"  - Has emoji: {has_emoji}")
            if word_count < 50 or has_emoji:
                print(f"  - SKIPPED (word_count={word_count}, has_emoji={has_emoji})")
                continue
            link = f"https://www.facebook.com/{post_id}"
            created = post.get('created_time', '')
            cdn_url = post.get('full_picture')
            local_image = download_image(cdn_url, post_id)
            all_posts.append({
                'id': post_id,
                'message': msg,
                'link': link,
                'created_time': created,
                'image': local_image
            })
        paging = data.get('paging', {})
        next_url = paging.get('next')
        url = next_url
        params = None
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
    # Step 1: Migrate existing posts to use local image paths
    migrate_existing_images()
    # Step 2: Fetch and save any new posts
    posts = fetch_fb_posts()
    save_posts(posts)
