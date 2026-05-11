import authModule from './auth/module';
import feedModule from './feed/module';
import contentModule from './content/module';

export {
  authModule,
  feedModule,
  contentModule
};

export default {
  auth: authModule,
  feed: feedModule,
  content: contentModule
};
