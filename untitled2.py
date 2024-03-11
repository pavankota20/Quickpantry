#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Mar 11 10:48:50 2024

@author: pavankumarkotapally
"""

import os
from PIL import Image

def find_image_formats(directory):
    for entry in os.listdir(directory):
        path = os.path.join(directory, entry)
        if os.path.isfile(path):
            try:
                with Image.open(path) as img:
                    print(f"{entry}: {img.format}")
            except IOError:
                # This error means PIL could not identify it as an image
                print(f"{entry} is not an identifiable image.")

directory_path = 'static/Images/19675/'
find_image_formats(directory_path)
