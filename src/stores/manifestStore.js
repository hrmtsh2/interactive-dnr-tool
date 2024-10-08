import { defineStore } from 'pinia';

export const useManifestStore = defineStore('manifest', {
  state: () => ({
    /*
    Signature of each object in rulesetFilePaths
    {
      rulesetFileName: 'rules_1.json',
      rulesetFilePath: 'path/to/ruleset.json',
      rulesetId: 'rulesetId',
      isEnabled: true | false
    }
    */
    rulesetFilePaths: [],
    isFirstVisit: true
  }),
  getters: {
    getRulesetFilePaths(state) {
      return state.rulesetFilePaths;
    }
  },
  actions: {
    setIsFirstVisit(value) {
      this.isFirstVisit = value;
    },
    clearRulesetFilePaths() {
      this.rulesetFilePaths = [];
    },
    setRulesetFilePaths(manifest) {
      if (manifest.declarative_net_request.rule_resources) {
        manifest.declarative_net_request.rule_resources.forEach((ruleset) => {
          const rulesetFilePath = ruleset.path;
          const rulesetFileName = rulesetFilePath.split('/').pop();

          this.rulesetFilePaths.push({
            rulesetFileName: rulesetFileName,
            rulesetFilePath: rulesetFilePath,
            rulesetId: ruleset.id,
            isEnabled: ruleset.enabled
          });
        });
      }
    },
    toggleRulesetAvailability(rulesetFileName) {
      const rulesetFilePathObject = this.rulesetFilePaths.find(
        (ruleset) => ruleset.rulesetFileName === rulesetFileName
      );
      rulesetFilePathObject.isEnabled = !rulesetFilePathObject.isEnabled;
    },
    isValidManifest(manifest) {
      let syntaxError = {};
      syntaxError['type'] = [];
      syntaxError['missingFields'] = [];
      syntaxError['invalidValueTypes'] = [];

      // Check for required fields
      const requiredFieldsAndTypes = {
        // "description" and "icon" required for uploading to web store
        // permissions required for extensions such as those using DNR
        name: 'string',
        version: 'string',
        manifest_version: 'number',
        permissions: 'array'
      };

      for (let field of Object.keys(requiredFieldsAndTypes)) {
        if (!Object.prototype.hasOwnProperty.call(manifest, field)) {
          syntaxError.isError = true;
          if (!syntaxError['type'].includes('missingFields')) {
            syntaxError['type'].push('missingFields');
            syntaxError['missingFields'] = [];
          }
          syntaxError['missingFields'].push(field);
        } else {
          const expectedType = requiredFieldsAndTypes[field];
          const actualValue = manifest[field];
          if (expectedType === 'array') {
            if (!Array.isArray(actualValue)) {
              syntaxError.isError = true;
              if (!syntaxError['type'].includes('invalidValueTypes')) {
                syntaxError['type'].push('invalidValueTypes');
                syntaxError['invalidValueTypes'] = [];
              }
              syntaxError['invalidValueTypes'].push(field);
            }
          } else if (typeof actualValue !== expectedType) {
            syntaxError.isError = true;
            if (!syntaxError['type'].includes('invalidValueTypes')) {
              syntaxError['type'].push('invalidValueTypes');
              syntaxError['invalidValueTypes'] = [];
            }
            syntaxError['invalidValueTypes'].push(field);
          }
        }
      }

      const otherFieldsAndTypes = {
        action: 'object',
        author: 'string',
        background: 'object',
        browser_action: 'object',
        chrome_settings_overrides: 'object',
        chrome_ui_overrides: 'object',
        chrome_url_overrides: 'object',
        commands: 'object',
        content_security_policy: 'string',
        content_scripts: 'array',
        converted_from_user_script: 'boolean',
        current_locale: 'string',
        default_locale: 'string',
        description: 'string',
        devtools_page: 'string',
        event_rules: 'array',
        externally_connectable: 'object',
        file_browser_handlers: 'array',
        file_system_provider_capabilities: 'object',
        homepage_url: 'string',
        host_permissions: 'array',
        icons: 'object',
        import: 'array',
        incognito: 'object',
        input_components: 'object',
        key: 'string',
        minimum_chrome_version: 'string',
        nacl_modules: 'array',
        oauth2: 'object',
        offline_enabled: 'boolean',
        omnibox: 'object',
        optional_permissions: 'array',
        options_page: 'string',
        options_ui: 'object',
        page_action: 'object',
        platforms: 'object',
        replacement_web_app: 'object',
        requirements: 'object',
        sandbox: 'object',
        short_name: 'string',
        sidebar_action: 'object',
        storage: 'object',
        tts_engine: 'object',
        update_url: 'string',
        version_name: 'string',
        web_accessible_resources: 'array',
        webview: 'object'
      };

      for (let field of Object.keys(otherFieldsAndTypes)) {
        if (Object.prototype.hasOwnProperty.call(manifest, field)) {
          const expectedType = otherFieldsAndTypes[field];
          const actualValue = manifest[field];
          if (expectedType === 'array') {
            if (!Array.isArray(actualValue)) {
              syntaxError.isError = true;
              if (!syntaxError['type'].includes('invalidValueTypes')) {
                syntaxError['type'].push('invalidValueTypes');
                syntaxError['invalidValueTypes'] = [];
              }
              syntaxError['invalidValueTypes'].push(field);
            }
          } else if (typeof actualValue !== expectedType) {
            syntaxError.isError = true;
            if (!syntaxError['type'].includes('invalidValueTypes')) {
              syntaxError['type'].push('invalidValueTypes');
              syntaxError['invalidValueTypes'] = [];
            }
            syntaxError['invalidValueTypes'].push(field);
          }
        }
      }

      // Check for declarativeNetRequest and declarativeNetRequestWithHostAccess permissions
      if (
        Object.prototype.hasOwnProperty.call(manifest, 'permissions') &&
        !manifest.permissions.includes('declarativeNetRequest') &&
        !manifest.permissions.includes('declarativeNetRequestWithHostAccess')
      ) {
        syntaxError.isError = true;
        if (!syntaxError['type'].includes('missingPermissions')) {
          syntaxError['type'].push('missingPermissions');
        }
      }

      // Remove empty error types
      if (syntaxError['missingFields'].length === 0) {
        delete syntaxError['missingFields'];
      }
      if (syntaxError['invalidValueTypes'].length === 0) {
        delete syntaxError['invalidValueTypes'];
      }

      if (syntaxError.isError) {
        return syntaxError;
      } else {
        return true;
      }
    }
  },
  persist: {
    storage: sessionStorage,
    paths: ['rulesetFilePaths', 'isFirstVisit']
  }
});
