export interface ServerUrlChoice {
  name: string;
  serverUrl?: string;
}

export class ServerChoices {
  static otherChoice: ServerUrlChoice = {name: 'Other', serverUrl: ''};

  static serverChoices: ServerUrlChoice[] = [
    {name: 'Production', serverUrl: 'https://twitarr.com'},
    {name: 'Beta', serverUrl: 'https://beta.twitarr.com'},
    this.otherChoice,
  ];

  static fromUrl = (url: string) => {
    return this.serverChoices.find(c => c.serverUrl === url) || this.otherChoice;
  };
}
