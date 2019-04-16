define(["activity/recordrtc", "sugar-web/activity/activity", "sugar-web/datastore", "activity/gif-recorder"], function (recordRTC, activity, datastore, gifRecorder) {

    function displayAlertMessage(message) {
        var div = document.createElement("p");
        div.innerHTML = message;
        div.style.color = "#f00";
        div.style.position = "fixed";
        div.style.top = "0px";
        div.style.width = "auto";
        div.style.padding = "4px";
        div.style.fontSize = "42px";
        div.style.background = "#fff";
        document.body.appendChild(div);
        div.style.left = document.body.clientWidth / 2 - (div.getBoundingClientRect().width / 2) + "px";
        setTimeout(function () {
            div.parentNode.removeChild(div);
        }, 3000);
    }

    var captureHelper = {
        ids: [],
        by: "by",
        popupMode: false,
        width: 320,
        height: 240,

        displayLoading: function () {
            var loading = document.getElementById("loading");
            loading.style.top = parseInt(5 * document.body.clientHeight / 100) + "px";
            loading.style.left = parseInt(5 * document.body.clientWidth / 100) + "px";
            loading.style.width = parseInt(90 * document.body.clientWidth / 100) + "px";
            loading.style.padding = "10px";
            loading.style.display = "block";
        },

        hideLoading: function () {
            var loading = document.getElementById("loading");
            loading.style.display = "none";
        },

        displayAllData: function (datas) {
            var t = this;
            for (var i = 0; i < datas.length; i++) {
                t.displayData(datas[i]);
            }
        },

        forgeAndInsertData: function (data) {
            var t = this;
            this.insertData(data, function (error, metadata) {
                var data = null;
                var datas = datastore.find();
                var found = false;
                for (i = 0; i < datas.length; i++) {
                    if (datas[i].objectId == metadata) {
                        found = true;
                        data = datas[i];
                        break;
                    }
                }
                if (!found) {
                    displayAlertMessage("No more space<br/><div style='text-align: center;'><img src='icons/emblem-warning.svg'></div>");
                    return;
                }
                t.ids.push(metadata);
                activity.getDatastoreObject().setDataAsText(JSON.stringify({ids: t.ids}));
                activity.getDatastoreObject().save(function (error) {
                });
				var dsObject = new datastore.DatastoreObject(data.objectId);
				dsObject.loadAsText(function(err, meta, text) {
					data.text = text;
					captureHelper.displayData(data, true);
				});
            });
        },

        deleteRecord: function(record,metadata){
            var t = this;
            var confirm = window.confirm(captureHelper.confirm);
            if(confirm){
                record.parentNode.removeChild(record);
                t.ids.splice(t.ids.indexOf(metadata),1);
                activity.getDatastoreObject().setDataAsText(JSON.stringify({ids: t.ids}));
                activity.getDatastoreObject().save(function (error) {
                });
            }
            
        },

        generateAudioPopup: function (fullData, originalAudio, metadata) {
            var audio = document.createElement("audio");

            audio.src = fullData.data;
            audio.style.padding = "0px";
            audio.style.zIndex = "98";
            audio.setAttribute("controls", "");
            audio.style.width = "100%";
            audio.style.height = "100px";
            audio.style.paddingBottom = "100px";

            return this.generatePopup(fullData, audio, originalAudio, metadata);
        },

        generateVideoPopup: function (fullData, originalVideo, metadata) {
            var video = document.createElement("video");

            video.src = fullData.data;
            video.style.padding = "0px";
            video.style.zIndex = "98";
            video.setAttribute("controls", "");
            video.style.width = "100%";
            video.style.maxHeight = (90 * document.body.clientHeight / 100) + "px";
            video.style.maxWidth = (90 * document.body.clientWidth / 100) + "px";
            video.style.paddingBottom = "100px";

            return this.generatePopup(fullData, video, originalVideo, metadata);
        },

        generateImagePopup: function (fullData, originalImage, metadata) {
            var img = document.createElement("img");
            //img.src = fullData.data;
            img.style.backgroundImage = "url('" + fullData.data + "')";
            img.style.backgroundRepeat = "no-repeat";
            img.style.backgroundPosition = "center center";

            img.style.padding = "0px";
            img.style.zIndex = "98";
            img.style.margin = "auto";
            img.style.display = "block";
            img.style.maxHeight = (90 * document.body.clientHeight / 100) + "px";
            img.style.maxWidth = (90 * document.body.clientWidth / 100) + "px";
            img.style.backgroundSize = "contain";
            img.setAttribute('height', img.style.maxHeight);
            img.setAttribute('width', img.style.maxWidth);

            return this.generatePopup(fullData, img, originalImage, metadata);
        },

        generatePopup: function (fullData, innerElement, originalImage, metadata) {
            var t = this;


            var div = document.createElement("div");


            div.style.position = "fixed";
            div.style.background = "#000";
            div.style.zIndex = "97";
            div.style.minHeight = "42px";
            div.style.top = parseInt(5 * document.body.clientHeight / 100) + "px";
            div.style.left = parseInt(5 * document.body.clientWidth / 100) + "px";
            div.style.width = parseInt(90 * document.body.clientWidth / 100) + "px";

            var title = document.createElement("span");
            title.style.zIndex = "98";
            title.style.padding = "5px";
            title.style.position = "absolute";
            title.innerHTML = metadata.title;
            title.style.background = "#000";
            title.style.color = "#fff";
            title.style.fontSize = "26px";
            div.appendChild(title);

            div.appendChild(innerElement);


            var closeButton = document.createElement("button");
            closeButton.style.position = "absolute";
            closeButton.style.zIndex = "99";
            closeButton.style.borderRadius = "0px";
            closeButton.style.float = "right";
            closeButton.style.backgroundImage = "url(icons/close.svg)";
            closeButton.style.backgroundRepeat = "no-repeat";
            closeButton.style.backgroundPosition = "center center";
            closeButton.style.width = "42px";
            closeButton.style.height = "42px";
            closeButton.style.top = "0px";
            closeButton.style.right = "0px";
            closeButton.addEventListener("click", function () {
                div.parentNode.removeChild(div);
                t.popupMode = false;
            });
            div.appendChild(closeButton);

            return div;
        },

        displayImage: function (fullData, first, metadata) {
            var t = this;

            var div = document.createElement("div");
            div.style.border = "1px solid #000";
            div.style.marginLeft = "5px";
            div.style.marginTop = "5px";
            div.style.width = this.width + "px";
            div.style.height = this.height + "px";
            div.style.display = 'inline-block';

            var img = document.createElement("div");
            img.style.display = "inline-block"
            img.style.border = "1px solid #000";
            img.zIndex = "98";
            img.style.position = "absolute";
            img.style.width = this.width + "px";
            img.style.height = this.height + "px";
            //img.src = fullData.data;
            img.style.backgroundImage = "url('" + fullData.data + "')";
            img.style.backgroundRepeat = "no-repeat";
            img.style.backgroundPosition = "center";

            div.appendChild(img);

            var videoIndicator = document.createElement("img");
            videoIndicator.style.display = 'inline-block';
            videoIndicator.style.float = "left";
            videoIndicator.style.position = "absolute";
            videoIndicator.zIndex = "99";
            videoIndicator.style.width = this.width + "px";
            videoIndicator.style.height = this.height + "px";
            videoIndicator.src = "icons/photo.svg";

            div.appendChild(videoIndicator); 


            var removeButton = document.createElement("button");
            removeButton.style.display = 'inline-block';
            removeButton.style.float = "left";
            removeButton.style.position = "absolute";
            removeButton.zIndex = "99";
            removeButton.className = "delbtn";
            removeButton.style.width = 0.2*this.width + "px";
            removeButton.style.height = 0.2*this.height + "px";
            removeButton.style.background = "url('icons/delete.svg')";
            removeButton.onclick = function(e){
                t.deleteRecord(removeButton.parentNode,metadata);
                e.stopPropagation();
            };

            div.appendChild(removeButton); 

        
            if (first && this.records.childNodes && this.records.childNodes.length > 0) {
                this.records.insertBefore(div, this.records.firstChild)
            } else {
                this.records.appendChild(div);
            }

            div.addEventListener("click", function () {
                if (t.popupMode) {
                    return;
                }
                t.popupMode = true;

                var popupDiv = t.generateImagePopup(fullData, img, metadata);
                document.body.appendChild(popupDiv);
            });
        },

        displayVideo: function (fullData, first, metadata) {
            var t = this;
            var div = document.createElement("div");
            div.style.border = "1px solid #000";
            div.style.marginLeft = "5px";
            div.style.marginTop = "5px";
            div.style.width = this.width + "px";
            div.style.height = this.height + "px";
            div.style.display = 'inline-block';


            var video = document.createElement("video");
            video.style.width = this.width + "px";
            video.style.height = this.height + "px";
            video.style.float = "left";
            video.zIndex = "98";
            video.style.position = "absolute";
            video.src = fullData.data;
            video.style.display = 'inline-block';

            div.appendChild(video);

            var videoIndicator = document.createElement("img");
            videoIndicator.style.display = 'inline-block';
            videoIndicator.style.float = "left";
            videoIndicator.style.position = "absolute";
            videoIndicator.zIndex = "99";
            videoIndicator.style.width = this.width + "px";
            videoIndicator.style.height = this.height + "px";
            videoIndicator.src = "icons/video.svg";

            div.appendChild(videoIndicator);

            var removeButton = document.createElement("button");
            removeButton.style.display = 'inline-block';
            removeButton.style.float = "left";
            removeButton.style.position = "absolute";
            removeButton.zIndex = "99";
            removeButton.className = "delbtn";
            removeButton.style.width = 0.2*this.width + "px";
            removeButton.style.height = 0.2*this.height + "px";
            removeButton.style.background = "url('icons/delete.svg')";
            removeButton.onclick = function(e){
                t.deleteRecord(removeButton.parentNode,metadata);
                e.stopPropagation();
            };

            div.appendChild(removeButton); 

            if (first && this.records.childNodes && this.records.childNodes.length > 0) {
                this.records.insertBefore(div, this.records.firstChild)
            } else {
                this.records.appendChild(div);
            }

            div.addEventListener("click", function () {
                if (t.popupMode) {
                    return;
                }
                t.popupMode = true;

                var popupDiv = t.generateVideoPopup(fullData, div, metadata);
                document.body.appendChild(popupDiv);
            });
        },

        displayAudio: function (fullData, first, metadata) {
            var t = this;

            var div = document.createElement("div");

            div.style.border = "1px solid #000";
            div.style.marginLeft = "5px";
            div.style.display = 'inline-block';
            div.style.marginTop = "5px";
            div.style.width = this.width + "px";
            div.style.height = this.height + "px";
            div.style.background = "#000";

            var removeButton = document.createElement("button");
            removeButton.style.display = 'inline-block';
            removeButton.style.float = "left";
            removeButton.style.position = "absolute";
            removeButton.zIndex = "99";
            removeButton.className = "delbtn";
            removeButton.style.width = 0.2*this.width + "px";
            removeButton.style.height = 0.2*this.height + "px";
            removeButton.style.background = "url('icons/delete.svg')";
            removeButton.onclick = function(e){
                t.deleteRecord(removeButton.parentNode,metadata);
                e.stopPropagation();
            };

            div.appendChild(removeButton);

            var img = document.createElement("img");
            img.src = "icons/audio.svg";
            img.style.width = this.width + "px";
            img.style.height = this.height + "px";
            img.style.display = 'inline-block';

            div.appendChild(img);
 

            if (first && this.records.childNodes && this.records.childNodes.length > 0) {
                this.records.insertBefore(div, this.records.firstChild)
            } else {
                this.records.appendChild(div);
            }

            div.addEventListener("click", function () {
                if (t.popupMode) {
                    return;
                }
                t.popupMode = true;

                var popupDiv = t.generateAudioPopup(fullData, div, metadata);
                document.body.appendChild(popupDiv);
            });
        },

        displayData: function (data, first) {
            var objectId = data.objectId;

            var fullData = {id: objectId, data: data.text};

            if (data.metadata.mimetype.indexOf("audio") === 0) {
                this.displayAudio(fullData, first, data.metadata);
            }

            if (data.metadata.mimetype.indexOf("video") === 0) {
                this.displayVideo(fullData, first, data.metadata);
            }

            if (data.metadata.mimetype.indexOf("image") === 0) {
                this.displayImage(fullData, first, data.metadata);
            }

        },

        getData: function (ids) {
            var allData = datastore.find();
            var medias = [];
            for (var i = 0; i < allData.length; i++) {
                var d = allData[i];

                if (!d.metadata || !d.metadata.mimetype || ids.indexOf(d.objectId) < 0) {
                    continue;
                }

                var mimetype = d.metadata.mimetype;
                if (mimetype.indexOf("audio") !== 0 && mimetype.indexOf("video") !== 0 && mimetype.indexOf("image") !== 0) {
                    continue;
                }

				var dsObject = new datastore.DatastoreObject(d.objectId);
				dsObject.loadAsText(function(err, metadata, text) {
					d.text = text;
					medias.push(d);
				});
            }
            return medias.reverse();
        },

        helper: undefined,

        getMimetypeWithData: function (data) {
            return data.split(";")[0].split(":")[1];
        },

        insertData: function (inputData, callback) {
            var mimetype = this.getMimetypeWithData(inputData);
            var type = mimetype.split("/")[0];
            var metadata = {
                mimetype: mimetype,
                title: type.charAt(0).toUpperCase() + type.slice(1) + " " + captureHelper.by + " " + captureHelper.buddy_name.charAt(0).toUpperCase() + captureHelper.buddy_name.slice(1),
                activity: "org.olpcfrance.MediaViewerActivity",
                timestamp: new Date().getTime(),
                creation_time: new Date().getTime(),
                file_size: 0
            };

            datastore.create(metadata, callback, inputData);
        },

        isCordova: function () {
            if (window.cordova || window.PhoneGap) {
                return true;
            } else {
                return false;
            }
        },

        init: function () {
            var t = this;
            var itemNumber = document.body.clientWidth / 160;
            this.width = document.body.clientWidth / itemNumber - 10;
            this.height = 240 * this.width / 320;
            this.records = document.getElementById("records");

            if (this.isCordova()) {
                this.helper = cordovaHelper;
            } else {
                this.helper = html5Helper;
                this.helper.timerStart = document.getElementById("timer-start");
                this.helper.timerEnd = document.getElementById("timer-end");

                this.loadingStop = document.getElementById("loading-stop");
                this.loadingStop.addEventListener("click", function () {
                    if (html5Helper.currentRecording && html5Helper.currentRecording.maxTime) {
                        html5Helper.currentRecording.time = html5Helper.currentRecording.maxTime;
                    }
                });
            }
            this.helper.init();
        }
    };

    var html5Helper = {
        recording: false,
        currentRecording: {},
        recordAudio: function () {
            if (this.recording) {
                return;
            }
            this.recording = true;
            var t = this;

            document.getElementById("loading-stop").style.display = "block";
            t.timerStart.style.display = "inline-block";
            t.timerEnd.style.display = "inline-block";
            document.getElementById("loading-progress").style.display = "inline-block";

            captureHelper.displayLoading();
            try {
                navigator.getUserMedia({audio: true}, function (mediaStream) {
                    var recordRTC = RecordRTC(mediaStream, {
                        type: 'audio'
                    });

                    recordRTC.startRecording();
                    var maxTime = 5;
                    t.currentRecording.time = 0;
                    var p = document.getElementById("loading-progress");
                    t.currentRecording.maxTime = maxTime;
                    p.setAttribute("max", maxTime.toString());
                    t.timerEnd.innerHTML = maxTime.toString() + "s";
                    t.timerStart.innerHTML = "0s";

                    t.currentRecording.interval = setInterval(function () {
                        t.currentRecording.time++;
                        p = document.getElementById("loading-progress");
                        p.value = t.currentRecording.time;
                        if (t.currentRecording.time <= maxTime) {
                            t.timerStart.innerHTML = t.currentRecording.time + "s";
                        }
                        if (t.currentRecording.time > t.currentRecording.maxTime) {
                            t.timerStart.innerHTML = "";
                            t.timerEnd.innerHTML = "";
                            document.getElementById("loading-progress").value = 0;
                            clearInterval(t.currentRecording.interval);
                            recordRTC.stopRecording(function () {
                                recordRTC.getDataURL(function (dataURL) {
                                    setTimeout(function () {
                                        captureHelper.forgeAndInsertData(dataURL);
                                        if (mediaStream.stop) mediaStream.stop();
                                        t.recording = false;
                                        captureHelper.hideLoading();
                                    }, 500);
                                }, false);
                            });
                        }
                    }, 1000);

                }, function (error) {
                    t.recording = false;
                    captureHelper.hideLoading();
                });
            } catch (e) {
                t.recording = false;
                captureHelper.hideLoading();
            }
        },

        recordVideo: function () {
            if (this.recording) {
                return;
            }

            this.recording = true;
            var t = this;

            document.getElementById("loading-stop").style.display = "block";
            t.timerStart.style.display = "inline-block";
            t.timerEnd.style.display = "inline-block";
            document.getElementById("loading-progress").style.display = "inline-block";

            captureHelper.displayLoading();
            try {
                navigator.getUserMedia({video: true}, function (mediaStream) {
                    var recordRTC = RecordRTC(mediaStream, {
                        type: 'video',
                        frameRate: 80,
                        quality: 0
                    });

                    document.querySelector('#vidDisplay').srcObject = mediaStream;
                    recordRTC.startRecording();
                    var maxTime = 5;
                    t.currentRecording.time = 0;
                    var p = document.getElementById("loading-progress");
                    t.currentRecording.maxTime = maxTime;
                    t.timerEnd.innerHTML = maxTime.toString() + "s";
                    p.setAttribute("max", maxTime.toString());
                    t.timerStart.innerHTML = "0s";

                    t.currentRecording.interval = setInterval(function () {
                        t.currentRecording.time++;
                        p = document.getElementById("loading-progress");
                        p.value = t.currentRecording.time;
                        if (t.currentRecording.time <= maxTime) {
                            t.timerStart.innerHTML = t.currentRecording.time + "s";
                        }
                        if (t.currentRecording.time > t.currentRecording.maxTime) {
                            t.timerStart.innerHTML = "";
                            t.timerEnd.innerHTML = "";
                            document.getElementById("loading-progress").value = 0;
                            clearInterval(t.currentRecording.interval);
                            recordRTC.stopRecording(function () {
                                recordRTC.getDataURL(function (dataURL) {
                                    setTimeout(function () {
                                        captureHelper.forgeAndInsertData(dataURL);
                                        if (mediaStream.stop) mediaStream.stop();
                                        t.recording = false;
                                        captureHelper.hideLoading();
                                    }, 500);
                                }, false);
                            });
                        }
                    }, 1000);

                }, function (error) {
                    t.recording = false;
                    captureHelper.hideLoading();
                });
            } catch (e) {
                t.recording = false;
                captureHelper.hideLoading();
            }
        },

        takePicture: function () {
            if (this.recording) {
                return;
            }
            this.recording = true;
            var t = this;

            t.timerStart.style.display = "none";
            t.timerEnd.style.display = "none";
            document.getElementById("loading-stop").style.display = "none";
            document.getElementById("loading-progress").style.display = "none";

            var video = document.createElement("video");
            try {
                captureHelper.displayLoading();
                navigator.getUserMedia({video: true}, function (mediaStream) {
                    var recordRTC = RecordRTC(mediaStream, {type: 'video'});
                    recordRTC.startRecording();
                    document.querySelector('#vidDisplay').srcObject = mediaStream;
                    setTimeout(function () {
                        t.timerStart.innerHTML = "";
                        t.timerEnd.innerHTML = "";
                        document.getElementById("loading-progress").value = 0;
                        recordRTC.stopRecording(function () {
                            recordRTC.getDataURL(function (dataURL) {
                                video.addEventListener('loadeddata', function () {
                                    video.play();
                                });

                                video.addEventListener('canplaythrough', function () {
                                    video.play();
                                });

                                video.addEventListener('canplay', function () {
                                    video.play();
                                });

                                video.addEventListener("playing", function () {
                                    setTimeout(function () {
                                        var canvas = document.createElement("canvas");
                                        var width = captureHelper.width;
                                        var height = captureHelper.height;

                                        canvas.width = width;
                                        canvas.height = height;

                                        canvas.getContext('2d').drawImage(video, 0, 0, width, height);
                                        var imgSrc = canvas.toDataURL("image/png");
                                        captureHelper.forgeAndInsertData(imgSrc);
                                        if (mediaStream.stop) mediaStream.stop();
                                        t.recording = false;
                                        captureHelper.hideLoading();
                                    }, 1200);
                                }, false);

                                video.src = dataURL;
                            });


                        });
                    }, 1500);
                }, function (error) {
                    t.recording = false;
                    captureHelper.hideLoading();
                });
            } catch (e) {
                t.recording = false;
                captureHelper.hideLoading();
            }
        },

        init: function () {
        }

    };

    var cordovaHelper = {

        cordovaLoaded: false,
        fileSystem: null,

        takePicture: function () {
            var captureSuccess = function (imageData) {
				var data = "data:image/jpeg;base64," + imageData;
				captureHelper.forgeAndInsertData(data);
			}

            // capture error callback
            var captureError = function (error) {
            };

            // start image capture
			navigator.camera.getPicture(captureSuccess, captureError, {
				quality: 50,
				targetWidth: 640,
				targetHeight: 480,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.CAMERA
			});
        },

        recordAudio: function () {
            var captureSuccess = function (mediaFiles) {
                var i, path, len;
                for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                    path = mediaFiles[i].fullPath;
                    if (path.indexOf("file:/") == -1) {
                        path = "file:/" + path;
                    }
                    path = path.replace("file:/", "file:///");

                    window.resolveLocalFileSystemURI(path, function (entry) {
                        entry.file(function (file) {
                            if (file.size / 1000000 > 2) {
                                displayAlertMessage("File is too big");
                                return;
                            }
                            var reader = new FileReader();
                            reader.onloadend = function (evt) {
                                captureHelper.forgeAndInsertData(evt.target.result);
                            };
                            reader.readAsDataURL(file);
                        }, function (err) {
                        })
                    }, function (err) {
                    });
                }
            };

            // capture error callback
            var captureError = function (error) {
            };

            // start image capture
			try {
				navigator.device.capture.captureAudio(captureSuccess, captureError, {
					limit: 1
				});
			} catch(err)
			{
			}
        },

        recordVideo: function () {
            var captureSuccess = function (mediaFiles) {
                var i, path, len;
                for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                    path = mediaFiles[i].fullPath;
                    if (path.indexOf("file:/") == -1) {
                        path = "file:/" + path;
                    }
                    path = path.replace("file:/", "file:///");

                    window.resolveLocalFileSystemURI(path, function (entry) {
                        entry.file(function (file) {
                            if (file.size / 1000000 > 2) {
                                displayAlertMessage("File is too big");
                                return;
                            }
                            var reader = new FileReader();
                            reader.onloadend = function (evt) {
                                captureHelper.forgeAndInsertData(evt.target.result);
                            };
                            reader.readAsDataURL(file);
                        }, function (err) {
                        })
                    }, function (err) {
                    });
                }
            };

            // capture error callback
            var captureError = function (error) {
            };

            // start image capture
			try {
				navigator.device.capture.captureVideo(captureSuccess, captureError, {
	                limit: 1,
	                quality: 0,
	                duration: 15,
	                width: captureHelper.width,
	                height: captureHelper.height
	            });
			} catch(err)
			{
			}
        },

        onDeviceReady: function () {
            var t = captureHelper.helper;
            t.cordovaLoaded = true;
        },

        init: function () {
            document.addEventListener("deviceready", this.onDeviceReady, false);
        }
    };

    return captureHelper;
});
