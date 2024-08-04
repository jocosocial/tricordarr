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
    {name: 'Emulator', serverUrl: 'http://10.0.2.2:8069'},
    this.otherChoice,
  ];

  static fromUrl = (url: string) => {
    return this.serverChoices.find(c => c.serverUrl === url) || this.otherChoice;
  };
}
