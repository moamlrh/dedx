# DEDX 

## Downloader Edx 

- You can download full course in [edx](https://edx.org)
- It's easy to use
- version 1.0.0


## Install

- Install with npm:
```
npm install dedx
```

- Install with yarn:
```
yarn add dedx
```

### How to use it ?

- after install it, you can call the dedx by : 
- You should pass required arguments:

```javascript
    const dedx = require('dedx')
    dedx(COURSE_ID, USERNAME, COOKIE)
```

##### The arguments :
###### COURSE_ID
```
  COURSE_ID = The course id you want to downloaded for ex : 
  // You want to download ***CS50's Understanding Technology*** course 
  // Course URL : https://www.edx.org/course/cs50s-understanding-technology
  // So the course id is : ***cs50s-understanding-technology****
```

###### USERNAME 
```  
  USERNAME = You account user name.
```

###### COOKIE 
```  
  COOKIE = Your login cookies from edx
```

###### OPTIONS
```
  OPTIONS = Is an object, You can use it by this way :
  
  ```javascript
    dedx(COURSE_ID, USERNAME, COOKIE, {
      limit: 0,             // to limit videos number for ex: to get only 10 video from this course || by default 0; 
      skipVideo: 0,         // to skip any video you want just pass the index ot this video for ex: pass video number 7 & will skip it ||  by default 0; 
      startVideo: 0,        // download will start from this video for ex: if you pass 5 that's mean will skip the first 4 videos ||  by default 0;
      endVideo: 0,          // for ex: if you pass 10 and the course has more then 10 videos will download just the first 10 videos and ignore other from 11-20 ||  by default 0;
      videoPath: "/videos", // the path to save the video || make sure this folad is found in the main file
    })
  ```
```

