import {isIOS} from '#src/Libraries/Platform/Detection';

export interface ServerUrlChoice {
  name: string;
  serverUrl?: string;
}

export class ServerChoices {
  static otherChoice: ServerUrlChoice = {name: 'Other', serverUrl: ''};

  static serverChoices: ServerUrlChoice[] = [
    {name: 'Production', serverUrl: 'https://twitarr.com'},
    {name: 'Beta', serverUrl: 'https://beta.twitarr.com'},
    {name: 'Alpha', serverUrl: 'https://twitarr.apps.grantcohoe.com'},
    {name: 'Emulator', serverUrl: isIOS ? 'http://127.0.0.1:5050' : 'http://10.0.2.2:5050'},
    {name: 'Start', serverUrl: 'https://start.twitarr.com'},
    this.otherChoice,
  ];

  static fromUrl = (url: string) => {
    return this.serverChoices.find(c => c.serverUrl === url) || this.otherChoice;
  };
}
