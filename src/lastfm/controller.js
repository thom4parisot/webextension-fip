import * as TextCleaner from '../lib/text-cleaner';
import Broadcast from '../lib/broadcast';
import LastfmAPI from '../lib/lastfm';

const LAST_FM_KEY = process.env.LAST_FM_KEY;

export default class ScrobblingController {
  constructor (process) {
    this.previousBroadcast = new Broadcast();

    this.setupClient(process);
    this.setupEvents(process);
  }

  static init(process) {
    return new ScrobblingController(process);
  };

  setupClient(process) {
    this.client = new LastfmAPI(process.preferences.get("lastfm.token"));
  };

  updateUserInfos(process, token){
    this.client.getSessionKey(token).then(data => {
      this.client.session_key = data.sessionKey;

      process.preferences.set("lastfm.token", data.sessionKey);
      process.preferences.set("lastfm.username", data.userName);
      process.preferences.set("lastfm.scrobbling", true);

      chrome.runtime.sendMessage({ "channel": "lastfm.auth.success", data });
    });
  };

  setupEvents(process) {
    chrome.runtime.onMessage.addListener(request => {
      if (request.channel === "broadcasts" && process.radio.state === "playing") {
        const current = Broadcast.getCurrent(request.data);

        this.processNowPlaying(current);
        this.processScrobbling(current);

        if (current && current.title !== this.previousBroadcast.title) {
          this.previousBroadcast = current;
        }
      }
    });

    chrome.runtime.onMessage.addListener(request => {
      if (request.channel === "lastfm.auth.response" && request.data){
        let token = null;

        request.data.replace(/token=([a-z0-9]{32})/, function(m, value){
          token = value;
        });

        if (token){
          this.updateUserInfos(process, token);
        }
      }
    });

    chrome.runtime.onMessage.addListener(request => {
      if (request.channel === "lastfm.auth.request" && request.data) {
        chrome.identity.launchWebAuthFlow({
          interactive: true,
          url: request.data + `&api_key=${LAST_FM_KEY}`
        }, this.handleAuthResponse.bind(this, process));
      }
    });
  };

  handleAuthResponse(process, url) {
    let token = null;

    url.replace(/token=([a-z0-9]{32})/, (m, value) => {
      token = value;
    });

    if (token){
      this.updateUserInfos(process, token);
    }
  }

  processNowPlaying(current) {
    if (!this.client.isConfigured() || !(current instanceof Broadcast)) {
      return;
    }

    const previous = this.previousBroadcast;

    if (current && current.artist && current.title !== previous.title && current.artist !== previous.artist) {
      this.client.nowPlaying({
        artist: TextCleaner.getMainArtistName(current.artist),
        track: TextCleaner.doTrackTitle(current.title)
      });
    }
  }

  processScrobbling(current) {
    if (!this.client.isConfigured() || !(current instanceof Broadcast)) {
      return;
    }

    var previous = this.previousBroadcast;

    if (current && previous.artist && current.title !== previous.title && current.artist !== previous.artist) {
      this.client.scrobble({
        artist: TextCleaner.getMainArtistName(previous.artist),
        track: TextCleaner.doTrackTitle(previous.title),
        when: Date.now() - 120 * 1000 // let's pretend we listened to it 2 minutes ago
      });
    }
  }
}
