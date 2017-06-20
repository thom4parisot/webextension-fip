import * as TextCleaner from '../lib/text-cleaner';
import Broadcast from '../lib/broadcast';
import LastfmAPI from '../lib/lastfm';
import browser from 'webextension-polyfill';

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
    this.client = new LastfmAPI(process.preferences.get('lastfm.token'));
  };

  updateUserInfos(process, token){
    const {preferences} = process;

    this.client.getSessionKey(token).then(data => {
      this.client.session_key = data.sessionKey;

      preferences.set('lastfm.token', data.sessionKey);
      preferences.set('lastfm.username', data.userName);
      preferences.set('lastfm.scrobbling', true);

      chrome.notify('lastfm.auth.success', data);
    });
  };

  setupEvents(process) {
    const {preferences} = process;


    browser.runtime.onConnect.addListener(port => {
      port.onMessage.addListener(data => {
        if ('broadcasts' in data && preferences.get('radio.state') === 'playing') {
          const current = Broadcast.getCurrent(data);

          this.processNowPlaying(current);
          this.processScrobbling(current);

          if (current && current.title !== this.previousBroadcast.title) {
            this.previousBroadcast = current;
          }
        }

        if ('lastfm.auth.request' in data) {
          chrome.identity.launchWebAuthFlow({
            interactive: true,
            url: `${data}&api_key=${LAST_FM_KEY}`
          }, url => this.handleAuthResponse(process, url));
        }
      });
    });
  };

  handleAuthResponse(process, url) {
    console.log(url);
    url.replace(/token=([a-z0-9]{32})/, (m, token) => {
      this.updateUserInfos(process, token);
    });
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
