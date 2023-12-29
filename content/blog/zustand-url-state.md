---
external: false
title: "Store Zustand State into URL, Sharing State Across the Web"
description: "You can author content using the familiar markdown syntax you already know. All basic markdown syntax is supported."
date: 2023-12-29T00:00:00.000Z
ogImagePath: /images/blogster.png
ogImageAltText: Blogster
ogImageWidth: 1200
ogImageHeight: 630
draft: false
tags:
  - docs
  - react
  - zustand
  - tips
---

![Blogster](/images/blogster.png)

## Introduction

In this tutorial, we'll explore how to Store Zustand state into the URL as a hash. Zustand is a lightweight state management framework that simplifies managing the state of your application. With URL hash storage, we can maintain the application's state even when the user navigates away from the current page. And let user copy the URL and share it with others, so that they can see the same state as the user.

## Code Setup

Let's start by setting up the initial code for our example application. We have a simple counter state using Zustand:

```ts
import create from "zustand";

const useCounter = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
}));
```

## Implementing State Storage in the URL Hash

To achieve this, we need to add the HashStorage utilities:

```ts
import { StateStorage } from "zustand/middleware";

export const hashStorage: StateStorage = {
  getItem: (key): string => {
    const searchParams = new URLSearchParams(location.hash.slice(1));
    const value = searchParams.get(key);
    // Helper function to decode the hash
    return decodeHash(String(value));
  },
  setItem: (key, newValue): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1));
    // Helper function to encode the hash
    const encodedValue = encodeHash(newValue);
    searchParams.set(key, encodedValue);
    location.hash = searchParams.toString();
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1));
    searchParams.delete(key);
    location.hash = searchParams.toString();
  },
};
```

Helper functions

```ts
/**
 * Decodes a string that has been encoded using base64 and URI encoding.
 * @param {string} str - The string to decode.
 * @returns {string} The decoded string.
 */
export function decodeHash(str) {
  // Decode the base64-encoded string.
  const decoded = atob(str);
  // Convert each character to its corresponding URI-encoded value.
  const uriEncoded = Array.prototype.map.call(decoded, function(c) {
    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
  });
  return decodeURIComponent(uriEncoded.join(""));
}

/**
 * Encodes a string using URI encoding and base64 encoding.
 * @param {string} str - The string to encode.
 * @returns {string} The encoded string.
 */
export function encodeHash(str) {
  // URI-encode the string and replace each URI-encoded character with its corresponding base64-encoded value.
  const base64Encoded = btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }),
  );
  return base64Encoded;
}
```

The hashStorage object and accompanying functions enable Zustand to store and retrieve state information in the URL hash. To handle character limitations in the URL hash, we encode and decode the state data to and from binary format or just stringify it. This allows us to share and persist data across page loads or between users by storing it in the URL hash.

Next, we'll modify the Zustand store to use hashStorage as the state storage method:

## Modify the Zustand store -

```ts
export const useCounter = create(
  persist(
    (set, get) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
      name: "counter",
      getStorage: () => hashStorage,
    },
  ),
);
```

In this modified Zustand store, we specify hashStorage as the storage method using the getStorage option. This means that our useCounter store will keep its state in the URL hash instead of using the browser's localStorage. Additionally, we assign the name "counter" to our store, which helps with troubleshooting and identification in the browser's developer tools.

By making these modifications, our Zustand store is optimized for usage with hashStorage, making it easier to store and retrieve state in the URL hash.

Now, when users interact with the useCounter store, the state will persist in the URL hash. For example, the URL might look like this:

```
https://saybackend.com#counter=eyJzdGF0ZSI6eyJxdXJhblRleHRFZGl0aW9uIjoiYXJh
```

This enables users to reload the page or share the URL while maintaining a consistent state across all instances.

## Conclusion

Implementing URL hash storage for Zustand allows you to create dynamic and shareable applications. By persisting the state in the URL, users can navigate across pages and even share the URL with others to see the same state. It enhances the user experience and provides a convenient way to maintain and communicate application state.

I hope this tutorial has been helpful in understanding how to store Zustand state into the URL as a hash. Happy coding!
