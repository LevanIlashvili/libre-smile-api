import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import fetch from 'node-fetch';

@Injectable()
export class AppService {
  private _rpc;
  private _nodeUrl = `http://hyperion.libre.quantumblok.com`;
  private _bankPrivateKey;
  private _bankName;
  private _api;

  constructor(private _configService: ConfigService) {
    this._rpc = new JsonRpc(this._nodeUrl, { fetch });
    this._bankPrivateKey = this._configService.get('BANK_PRIVATE_KEY');
    this._bankName = this._configService.get('BANK_NAME');
    const signatureProvider = new JsSignatureProvider([this._bankPrivateKey]);
    this._api = new Api({
      rpc: this._rpc,
      signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });
  }

  async transfer(to: string, sats: number) {
    const amountInBTC = sats / 10 ** 8;
    console.log(`Transferring ${amountInBTC} PBTC to ${to}`);
    const actions = [
      {
        account: 'btc.ptokens',
        name: 'transfer',
        authorization: [
          {
            actor: this._bankName,
            permission: 'owner',
          },
        ],
        data: {
          from: this._bankName,
          to,
          quantity: `${amountInBTC.toFixed(9)} PBTC`,
          memo: 'Thanks for smiling',
        },
      },
    ];
    console.log(actions);
    const transaction = await this._api.transact(
      {
        actions,
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      },
    );
    return transaction;
  }
}
