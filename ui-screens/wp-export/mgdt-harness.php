<?php
/* Local install-test harness for ui-screens/wp-export/installtest.mjs (templates r4, 21-Nov-2026). Playground only, never a real site.
   /?mgdt=log[&clear=1] | install&zip=<file in /zips> | activate&slug=<theme> | title&v=<site title> -> JSON */
$mgdt_log = WP_CONTENT_DIR . '/mgdt-php.log';
ini_set('log_errors', '1'); ini_set('error_log', $mgdt_log); ini_set('display_errors', '0'); error_reporting(E_ALL);
add_action('init', function () use ($mgdt_log) {
  if (empty($_GET['mgdt'])) return;
  $a = $_GET['mgdt']; $out = ['ok' => false];
  try {
    if ($a === 'log') { if (!empty($_GET['clear'])) { @file_put_contents($mgdt_log, ''); } $out = ['ok' => true, 'log' => (string) @file_get_contents($mgdt_log)]; }
    elseif ($a === 'install') {
      $zip = '/zips/' . basename((string) $_GET['zip']);
      if (!file_exists($zip)) throw new Exception('no zip ' . $zip);
      require_once ABSPATH . 'wp-admin/includes/file.php'; require_once ABSPATH . 'wp-admin/includes/misc.php'; require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php'; require_once ABSPATH . 'wp-admin/includes/theme.php';
      if (!function_exists('request_filesystem_credentials')) require_once ABSPATH . 'wp-admin/includes/file.php';
      WP_Filesystem();
      $skin = new WP_Ajax_Upgrader_Skin(); $up = new Theme_Upgrader($skin);
      $r = $up->install($zip, ['overwrite_package' => true]);
      $msgs = $skin->get_upgrade_messages(); $err = $skin->get_errors();
      if (is_wp_error($r)) $out = ['ok' => false, 'err' => $r->get_error_message(), 'msg' => $msgs];
      elseif ($err->has_errors()) $out = ['ok' => false, 'err' => $err->get_error_message(), 'msg' => $msgs];
      else $out = ['ok' => (bool) $r, 'msg' => $msgs];
    }
    elseif ($a === 'activate') {
      $slug = sanitize_key((string) $_GET['slug']); $t = wp_get_theme($slug);
      if (!$t->exists()) throw new Exception('theme missing ' . $slug); if ($t->errors()) throw new Exception($t->errors()->get_error_message());
      switch_theme($slug); global $wp_version;
      $out = ['ok' => get_stylesheet() === $slug, 'block' => wp_get_theme($slug)->is_block_theme(), 'ver' => $wp_version, 'php' => PHP_VERSION];
    }
    elseif ($a === 'title') { update_option('blogname', wp_unslash((string) $_GET['v'])); $out = ['ok' => true]; }
  } catch (Throwable $e) { $out = ['ok' => false, 'err' => $e->getMessage()]; }
  header('Content-Type: application/json'); echo wp_json_encode($out); exit;
}, 1);
// The Playground session is logged in (--login, for the Site Editor check). Keep the front end as a visitor sees it: no admin bar, no avatar request.
add_filter('show_admin_bar', '__return_false');
add_filter('pre_option_show_avatars', '__return_zero');
// Playground's PHP does not honour the error_log ini for every notice, so warnings are also written by a handler (returns false: normal handling continues).
set_error_handler(function ($no, $str, $file, $line) use ($mgdt_log) {
  $k = [E_WARNING => 'Warning', E_NOTICE => 'Notice', E_DEPRECATED => 'Deprecated', E_USER_WARNING => 'Warning', E_USER_NOTICE => 'Notice', E_USER_DEPRECATED => 'Deprecated'][$no] ?? 'Error';
  if (strpos($file, '/mu-plugins/mgdt.php') === false) @file_put_contents($mgdt_log, gmdate('c') . " PHP $k:  $str in $file on line $line\n", FILE_APPEND);
  return false;
});
register_shutdown_function(function () use ($mgdt_log) { $e = error_get_last(); if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_COMPILE_ERROR, E_CORE_ERROR], true)) @file_put_contents($mgdt_log, gmdate('c') . " PHP Fatal error:  {$e['message']} in {$e['file']} on line {$e['line']}\n", FILE_APPEND); });
// The Playground has no reliable outbound HTTP from PHP, so WordPress.org update checks only add "unexpected error" warnings that say nothing about
// the theme. Switch them off (upgrader_process_complete -> wp_update_themes fires after every Theme_Upgrader install).
foreach ([['upgrader_process_complete', 'wp_update_themes'], ['upgrader_process_complete', 'wp_update_plugins'], ['upgrader_process_complete', 'wp_version_check'], ['admin_init', '_maybe_update_themes'], ['admin_init', '_maybe_update_plugins'], ['admin_init', '_maybe_update_core'], ['wp_update_themes', 'wp_update_themes'], ['wp_update_plugins', 'wp_update_plugins'], ['wp_version_check', 'wp_version_check'], ['load-themes.php', 'wp_update_themes'], ['load-update.php', 'wp_update_themes'], ['load-update-core.php', 'wp_update_themes'], ['init', 'wp_schedule_update_checks']] as $h) { remove_action($h[0], $h[1]); remove_action($h[0], $h[1], 10); }
add_filter('automatic_updater_disabled', '__return_true');
