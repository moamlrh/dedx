require("dotenv").config();
const fs = require("fs");
const Path = require("path");
const chalk = require("chalk");
const { default: axios } = require("axios");

const EDX_URL = "https://courses.edx.org/api/courses/v2/blocks";

async function edxDownloader(
  courseId,
  username,
  Cookie,
  options = {
    limit: 0,
    skipVideo: 0,
    startVideo: 0,
    endVideo: 0,
    videoPath: "/videos",
  },
  depth = "all"
) {
  if (!courseId) {
    throw new Error(chalk.red("[] - Course id is required !"));
  } else if (!username) {
    throw new Error(chalk.red("[] - Your username is required !"));
  } else if (!Cookie) {
    throw new Error(chalk.red("[] - Your Cookie is required !"));
  }
  console.log(chalk.bgCyan("\t".repeat(40)));
  console.log("\t[+] Just wait .... ");
  console.log(`\t[+] Username : ${chalk.green(username)} `);
  console.log("\n");
  let { startVideo, endVideo, limit, videoPath, skipVideo } = options;
  const encdedId = encodeURIComponent(courseId);
  const url = `${EDX_URL}/?course_id=${encdedId}&username=${username}&depth=${depth}`;
  console.log(chalk.bgCyan("\t".repeat(29)));

  // set cookies to axios
  axios.interceptors.request.use((config) => {
    config.headers = {
      Cookie,
    };
    return config;
  });

  try {
    const { data } = await axios.get(url);
    let videos = [];
    for (const key in data.blocks) {
      if (data.blocks.hasOwnProperty.call(data.blocks, key)) {
        const ele = data.blocks[key];
        if (ele.type === "video") {
          videos.push({
            name: ele.display_name,
            url: ele.student_view_url,
          });
        }
      }
    }
    if (skipVideo > 0) {
      skipVideo -= 1;
      videos = videos.filter((_, idx) => idx !== skipVideo);
    }
    if (startVideo > 0) {
      startVideo -= 1;
      videos = videos.splice(startVideo);
    }
    if (endVideo > 0) {
      endVideo -= 1;
      videos = videos.slice(0, endVideo);
    }
    if (limit > 0) {
      limit -= 1;
      videos = videos.splice(0, limit);
    }

    if (videos.length > 0) {
      console.log(
        `[+] 😲 It will take some time to download ${chalk.cyan(
          videos.length
        )} videos !`
      );
      checkInfoBeforeDownload(videos, videoPath);
    } else {
      console.log(chalk.red("[-] 🤒 There is no video to download !"));
      return;
    }
  } catch (error) {
    if (error.response) {
      const { status, statusText, data } = error.response;
      if (status && statusText && data) {
        console.log(chalk.red(`[ERROR] - 🥺 ${statusText}`));
        console.log(chalk.red(`[ERROR] - 😤 Status Code : ${status}`));
        console.log(chalk.red(`[ERROR] - 🥵 ${data.developer_message}`));
      } else {
        console.log(status || statusText || data);
      }
    } else {
      console.log(error);
    }
  }
}
const checkInfoBeforeDownload = async (videos, videoPath) => {
  let num = 0;
  try {
    getVideoInfo(videos, num, videoPath);
  } catch (error) {
    console.log(error);
  }
};
const getVideoInfo = async (videos, num, videoPath) => {
  try {
    const { data } = await axios.get(videos[num].url);
    const videoUrl = data
      .split("video-download-button")[1]
      .split("Download video file")[0]
      .split('"')[2];
    const videoName = videos[num].name;

    const path = Path.join(
      __dirname,
      videoPath || "/videos",
      num + "-" + videoName + "-" + Date.now() + ".mp4"
    );
    if (num < videos.length - 1) {
      downloadVideo(path, videoUrl, videoName, num, videos);
    } else {
      console.log("\n\r[+] - Done, donwloaded all videos !");
    }
  } catch (error) {
    console.log(error);
  }
};
const downloadVideo = async (path, videoUrl, videoName, num, videos) => {
  try {
    const { data } = await axios.get(videoUrl, { responseType: "stream" });
    const stream = fs.createWriteStream(path);

    stream.on("open", () => {
      console.log(
        chalk.green(
          `\n [*] 👉 Start Download Video: ${chalk.cyanBright(
            num
          )} - Title : ${chalk.cyan(videoName)}`
        )
      );
      data.pipe(stream);
    });

    stream.on("close", () => {
      if (num < videos.length - 1) {
        num += 1;
        getVideoInfo(videos, num);
      } else {
        console.log(
          `[*] 😍 It' done and all videos [${videos.length}] downloaded successfully `
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const dedx = edxDownloader;
module.exports = dedx;
