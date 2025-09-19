// lib/elasticsearch.ts
import { Client } from '@elastic/elasticsearch';

const elastic = new Client({
  node: 'http://localhost:9200',
  apiVersion: "8.13"
});

export default elastic;

