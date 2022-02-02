import type {NginxAccessLog, NginxSiteAvailable} from '@nxtranet/headers';
import fs from 'fs';
import mustache from 'mustache';
import path from 'path';
import type {Socket} from 'socket.io-client';
import {io} from 'socket.io-client';

export type NginxProdConfig = {
  domain: string;
  ports: number[];
  projectName: string;
  clusterName: string;
}

type NginxDevConfig = {
  domain: string;
  port: number;
}

const templateProdPath = path.join(
  __dirname,
  '../../../../config/nginx/template.production.conf',
);

const templateDevPath = path.join(
  __dirname,
  '../../../../config/nginx/template.single.conf',
)

const socket = io('http://localhost:3211');

export
  class NginxService {
  private _socket: Socket = socket;

  constructor(
  ) {
  }

  formatCacheName(name: string) {
    return `cache_${name}`;
  }

  formatUpstreamName(name: string) {
    return `upstream_${name}`;
  }

  formatFilename(projectName: string, clusterName: string) {
    return `${projectName}_${clusterName}`;
  }

  generateUpstream(upstream: string, ports: number[]) {
    return `
upstream ${upstream} {
\tip_hash;
\t${ports.reduce((acc, port, i) => {
      return acc += `server 127.0.0.1:${port};${i === ports.length - 1 ? '' : '\n\t'}`;
    }, '')}
}# Generated by nxtranet ereased if you edit on next deploy`
  }

  updateProdConfig = async (config: NginxProdConfig, oldConfig?: NginxProdConfig) => {
    const {
      projectName,
      clusterName,
      ports,
    } = config;
    const oldCacheName = this.formatCacheName(oldConfig?.projectName || config.projectName);
    const oldUpstreamName = this.formatUpstreamName(oldConfig?.projectName || config.projectName);
    const newCacheName = this.formatCacheName(config.projectName);
    const newUpstreamName = this.formatUpstreamName(config.projectName)
    let file = await this.readSiteAvailable(this.formatFilename(projectName, clusterName));
    const cacheReg = new RegExp(oldCacheName, 'gi');
    file = file.replace(cacheReg, newCacheName);
    const upstreamReg = new RegExp(oldUpstreamName, 'gi');
    file = file.replace(upstreamReg, newUpstreamName);
    const newUpstreamBlock = this.generateUpstream(newUpstreamName, ports);
    file = file.replace(/upstream .*{[^\\n]+}/gm, newUpstreamBlock);
    await this.writeSiteAvailable(this.formatFilename(projectName, clusterName), file);
  }

  writeDevConfig = async (filename: string, config: NginxDevConfig) => {
    const d = fs.readFileSync(templateDevPath, 'utf-8');
    const render = mustache.render(d, {
      port: config.port,
      domain_name: config.domain,
    });
    await this.writeSiteAvailable(filename, render);
  }

  createProdConfig = async (config: NginxProdConfig) => {
    const {
      ports,
      domain,
      projectName,
      clusterName,
    } = config;
    const d = fs.readFileSync(templateProdPath, 'utf-8');
    const render = mustache.render(d, {
      ports,
      domain_name: domain,
      upstream: this.formatUpstreamName(projectName),
      cache_name: this.formatCacheName(projectName),
    });
    await this.writeSiteAvailable(this.formatFilename(projectName, clusterName), render);
  }

  getSitesAvailable = (): Promise<NginxSiteAvailable[]> => {
    return new Promise<NginxSiteAvailable[]>((resolve, reject) => {
      this._socket.emit('/sites-available',
        (err: Error, data: NginxSiteAvailable[]) => {
          if (err) return reject(err);
          return resolve(data);
        });
    });
  }

  writeSiteAvailable = (filename: string, content: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      this._socket.emit('/sites-available/write', {
        filename,
        content,
      }, (err: Error) => {
        if (err) return reject(err);
        return resolve();
      })
    })
  }

  readSiteAvailable = (filename: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      this._socket.emit('/sites-available/read', filename, (err: Error, content: string) => {
        if (err) return reject(err);
        return resolve(content);
      });
    });
  }

  siteAvailableExists = (filename: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      this._socket.emit('/sites-available/exists', filename, (err: Error, exists: boolean) => {
        if (err) return reject(err);
        return resolve(exists);
      });
    });
  }

  siteEnabledExists = (filename: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      this._socket.emit('/sites-enabled/exists', filename, (err: Error, exists: boolean) => {
        if (err) return reject(err);
        return resolve(exists);
      });
    });
  }

  deploySiteAvailable = (filename: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      this._socket.emit('/sites-available/deploy', filename, (err: Error) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  monitorAccessLog = (callback = (err: Error | null, log: NginxAccessLog) => { }) => {
    this._socket.on('/monitor/access-log/error', callback);
    this._socket.on('/monitor/access-log/new', (log: NginxAccessLog) => {
      callback(null, log);
    });
    this._socket.emit('/monitor/access-log');
  }

  testConfig = (): Promise<{stderr: string, stdout: string}> => {
    return new Promise<{stderr: string, stdout: string}>((resolve, reject) => {
      this._socket.emit('/test', (err: Error, res: {stderr: string, stdout: string}) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  }

  restartService = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      this._socket.emit('/restart', (err: Error) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  reloadService = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      this._socket.emit('/reload', (err: Error) => {
        if (err) return reject(err);
        return resolve();
      })
    });
  }

  disconnect = () => {
    this._socket.disconnect();
  }
}
