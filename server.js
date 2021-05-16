require("dotenv").config();
const fs = require("fs");
const Path = require("path");
const { default: axios } = require("axios");

/**
 *  - get course information : https://courses.edx.org/api/courses/v2/blocks/?course_id=course-v1%3AHarvardX%2BCS50%2BX&username=moaml_riad&depth=100
 *  - download video : https://edx-video.net/f84f414a-9f7b-484a-b512-d68ce298c871-mp4_720p.mp4
 */

async function edxDownloader(courseId, username, depth, Cookie, limit = 0) {
  const encdedId = encodeURIComponent(courseId);
  const url = `https://courses.edx.org/api/courses/v2/blocks/?course_id=${encdedId}&username=${username}&depth=${depth}`;
  axios.interceptors.request.use((config) => {
    config.headers = {
      Cookie,
    };
    return config;
  });
  try {
    const { data } = await axios.get(url);
    let allVideiosUrl = [];
    for (const key in data.blocks) {
      if (data.blocks.hasOwnProperty.call(data.blocks, key)) {
        const ele = data.blocks[key];
        if (ele.type === "video") {
          allVideiosUrl.push(ele.student_view_url);
        }
      }
    }
    getArrayUrls(allVideiosUrl, limit);
  } catch (error) {
    console.log(error);
  }
}

const getArrayUrls = async (urls, limit) => {
  if (limit > 0 || urls.length !== limit) {
    urls = urls.splice(1, limit);
  }
  try {
    if (urls.length > 30) {
      console.log(
        `[+] 😱 It will take some time to download ${urls.length} videos !`
      );
    } else {
      console.log("[+] 🥰 Start ...");
    }
    const arrOfRequests = urls.map((url) => {
      return axios.get(url);
    });
    let videoName, videoUrl;
    const result = await axios.all(arrOfRequests);
    const arr = result.map((res) => {
      videoUrl = res.data
        .split("video-download-button")[1]
        .split("Download video file")[0]
        .split('"')[2];
      videoName = res.data.split('<h3 class="hd hd-2">')[1].split("</h3>\n")[0];
      return { videoUrl, videoName };
    });
    oneVideoPerTime(arr);
  } catch (error) {
    console.log(error);
  }
};

const oneVideoPerTime = async (arr) => {
  let num = 0;
  const videoUrl = arr[num].videoUrl;
  const videoName = arr[num].videoName;
  const path = Path.join(
    __dirname,
    "videos",
    num + "-" + videoName + "-" + Date.now() + ".mp4"
  );
  console.log(`[*] 🙄 You will donwload ${arr.length} video !`);
  downloadVideo(path, videoUrl, videoName, num, arr);
};

const downloadVideo = async (path, videoUrl, videoName, num, arr) => {
  try {
    const { data } = await axios.get(videoUrl, { responseType: "stream" });
    const stream = fs.createWriteStream(path);
    stream.on("open", (number) => {
      console.log(`[*] 👉 Video number ${num} - Title : ${videoName}`);
      data.pipe(stream);
    });
    stream.on("close", () => {
      if (num < arr.length - 1) {
        num += 1;
        downloadVideo(path, videoUrl, videoName, num, arr);
      } else {
        console.log(
          `[*] 😍 It' done and all videos [${arr.length}] downloaded successfully `
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const courseId = "course-v1:LinuxFoundationX+LFS101x+1T2020";
const depth = 100;
const username = process.env.EDX_ACCOUNT_USERNAME;
const cookie = process.env.EDX_COOKIES;
const limit = 5;

edxDownloader(courseId, username, depth, cookie, limit);
module.exports = edxDownloader;
