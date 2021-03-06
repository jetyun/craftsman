(function() {
  angular
    .module('template/treeGrid/treeGrid.html', [])
    .run([
      '$templateCache',
      function($templateCache) {
        $templateCache.put('template/treeGrid/treeGrid.html',
          "<div class=\"m-unselect m-container\">\n" +
          "<div class=\"table-responsive\">\n" +
          " <table class=\"table tree-grid table-hover\">\n" +
          "   <thead>\n" +
          "     <tr>\n" +
          "       <th>{{expandingProperty.displayName || expandingProperty.field || expandingProperty}}</th>\n" +
          "       <th ng-repeat=\"col in colDefinitions\">{{col.displayName || col.field}}</th>\n" +
          "     </tr>\n" +
          "   </thead>\n" +
          "   <tbody>\n" +
          "     <tr ng-click=\"user_select_branch(row.branch)\" ng-mouseup=\"user_mouseup_branch(row.branch, $event)\" ng-mousedown=\"user_mousedown_branch(row.branch, $event)\" ng-repeat=\"row in tree_rows | filter:{visible:true} track by row.branch.uid\"\n" +
          "       ng-class=\"'level-' + {{ row.level }} + (row.branch.selected ? ' active':'')\" class=\"tree-grid-row\">\n" +
          "       <td><span ng-if=\"allowExpand !== false\"><a ng-click=\"user_clicks_branch(row.branch, $event)\" ng-mousedown=\"user_clicks_down($event)\" ng-mouseup=\"user_clicks_up($event)\"><i ng-class=\"row.tree_icon\"\n" +
          "              ng-click=\"row.branch.expanded = !row.branch.expanded\"\n" +
          "              class=\"indented tree-icon\">\n" +
          "           </i>\n" +
          "           </a></span>\n" +
          "           <label ng-if=\"row.branch.checked === true\" class=\"indented tree-checkbox\"><input ng-click=\"user_click_checkbox(row.branch,$event)\" ng-mousedown=\"user_mousedown_checkbox(row.branch,$event)\" ng-mouseup=\"user_mouseup_checkbox(row.branch,$event)\" checked type=\"checkbox\" style=\"margin-left:9px;\" ng-show=\"{{allowCheckbox}}\" value=\"{{row.branch.id}}\"></label>\n" +
          "           <label ng-if=\"row.branch.checked !== true\" class=\"indented tree-checkbox\"><input ng-click=\"user_click_checkbox(row.branch,$event)\" ng-mousedown=\"user_mousedown_checkbox(row.branch,$event)\" ng-mouseup=\"user_mouseup_checkbox(row.branch,$event)\" type=\"checkbox\" style=\"margin-left:9px;\" ng-show=\"{{allowCheckbox}}\" value=\"{{row.branch.id}}\"></label>\n" +
          "            <span class=\"indented tree-label\" ng-click=\"on_user_click(row.branch)\">\n" +
          "             {{row.branch[expandingProperty.field] || row.branch[expandingProperty]}}</span>\n" +
          "       </td>\n" +
          "       <td ng-repeat=\"col in colDefinitions\">\n" +
          "         <div ng-if=\"col.cellTemplate\" compile=\"col.cellTemplate\" cell-template-scope=\"col.cellTemplateScope\"></div>\n" +
          "         <div ng-if=\"!col.cellTemplate\">{{row.branch[col.field]}}</div>\n" +
          "       </td>\n" +
          "     </tr>\n" +
          "   </tbody>\n" +
          " </table>\n" +
          "</div>\n" +
          "<div ng-show=\"info.show\" class=\"alert alert-success\" style=\"padding:0;position:absolute;left:{{info.position.left ? info.position.left : 0}}px;top:{{info.position.top ? info.position.top : 0}}px;\" role=\"alert\">\n" +
          "<table style=\"margin:0;\" class=\"table\"><tr>\n" +
          "       <td><span class=\"indented tree-label\"\n" +
          "             {{info.content[expandingProperty.field] || info.content[expandingProperty]}}</span>\n" +
          "       </td>\n" +
          "       <td ng-repeat=\"col in colDefinitions\">\n" +
          "         <div ng-if=\"col.cellTemplate\" compile-info=\"col.cellTemplateInfo\" cell-template-scope-info=\"col.cellTemplateScopeInfo\"></div>\n" +
          "         <div ng-if=\"!col.cellTemplate\">{{info.content[col.field]}}</div>\n" +
          "       </td>\n" +
          "</tr></table></div>\n" +
          "</div>\n" +
          "");
      }
    ]);

  angular
    .module('treeGrid', [
      'template/treeGrid/treeGrid.html'
    ])

  .directive('compile', [
    '$compile',
    function($compile) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          scope.cellTemplateScope = scope.$eval(attrs.cellTemplateScope);

          // Watch for changes to expression.
          scope.$watch(attrs.compile, function(new_val) {
            /*
             * Compile creates a linking function
             * that can be used with any scope.
             */
            var link = $compile(new_val);

            /*
             * Executing the linking function
             * creates a new element.
             */
            var new_elem = link(scope);

            // Which we can then append to our DOM element.
            element.append(new_elem);
          });
        }
      };
    }
  ])
    .directive('compileInfo', [
      '$compile',
      function($compile) {
        return {
          restrict: 'A',
          link: function(scope, element, attrs) {
            scope.cellTemplateScopeInfo = scope.$eval(attrs.cellTemplateScopeInfo);

            // Watch for changes to expression.
            scope.$watch(attrs.compileInfo, function(new_val) {
              /*
               * Compile creates a linking function
               * that can be used with any scope.
               */
              var link = $compile(new_val);

              /*
               * Executing the linking function
               * creates a new element.
               */
              var new_elem = link(scope);

              // Which we can then append to our DOM element.
              element.append(new_elem);
            });
          }
        };
      }
    ])
    .directive('treeGrid', [
      '$timeout',
      'treegridTemplate',
      function($timeout,
        treegridTemplate) {

        return {
          restrict: 'E',
          templateUrl: function(tElement, tAttrs) {
            return tAttrs.templateUrl || treegridTemplate.getPath();
          },
          replace: true,
          scope: {
            treeData: '=',
            colDefs: '=',
            expandOn: '=',
            onSelect: '&',
            onClick: '&',
            onExpand: '&',
            onMoveUpdate: '&',
            onOrderUp: '&',
            onOrderDown: '&',
            onTreeDataPromised: '&',
            initialSelection: '@',
            treeControl: '=',
            allowMove: '=',
            allowCheckbox: '=',
            allowExpand: '='
          },
          link: function(scope, element, attrs) {
            if (scope.allowCheckbox !== true)
              scope.allowCheckbox = false;
            scope.info = {
              position: {
                left: 0,
                top: 0
              },
              content: "",
              show: false
            };
            var error, expandingProperty, expand_all_parents, expand_level, for_all_ancestors, for_each_branch, get_parent, n;
            var on_treeData_change, select_branch, move_update_branch, selected_branch, tree, move_branch, remove_child, order_up, order_down;
            var get_prev_sibling, get_siblings, get_first_child, get_next_sibling, get_last_child;
            var find_branch_by_condition, find_tree_by_condition, on_treeData;
            var check_parent, check_all_parent, uncheck_chilren, uncheck_all_children, get_children;
            var check_children, check_all_children;
            var is_all_children_checked, is_all_children_unchecked, uncheck_parent, uncheck_all_parent;

            error = function(s) {
              console.log('ERROR:' + s);
              debugger;
              return void 0;
            };

            attrs.iconExpand = attrs.iconExpand ? attrs.iconExpand : 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
            attrs.iconCollapse = attrs.iconCollapse ? attrs.iconCollapse : 'icon-minus glyphicon glyphicon-minus fa fa-minus';
            attrs.iconLeaf = attrs.iconLeaf ? attrs.iconLeaf : 'icon-file  glyphicon glyphicon-file  fa fa-file';
            attrs.expandLevel = attrs.expandLevel ? attrs.expandLevel : '3';
            expand_level = parseInt(attrs.expandLevel, 10);

            if (!scope.treeData) {
              alert('No data was defined for the tree, please define treeData!');
              return;
            }

            var getExpandingProperty = function getExpandingProperty() {
              if (attrs.expandOn) {
                expandingProperty = scope.expandOn;
                scope.expandingProperty = scope.expandOn;
              } else {
                if (scope.treeData.length) {
                  var _firstRow = scope.treeData[0],
                    _keys = Object.keys(_firstRow);
                  for (var i = 0, len = _keys.length; i < len; i++) {
                    if (typeof(_firstRow[_keys[i]]) === 'string') {
                      expandingProperty = _keys[i];
                      break;
                    }
                  }
                  if (!expandingProperty) expandingProperty = _keys[0];
                  scope.expandingProperty = expandingProperty;
                }
              }
            };

            getExpandingProperty();

            if (!attrs.colDefs) {
              if (scope.treeData.length) {
                var _col_defs = [],
                  _firstRow = scope.treeData[0],
                  _unwantedColumn = ['children', 'level', 'expanded', expandingProperty];
                for (var idx in _firstRow) {
                  if (_unwantedColumn.indexOf(idx) === -1) {
                    _col_defs.push({
                      field: idx
                    });
                  }
                }
                scope.colDefinitions = _col_defs;
              }
            } else {
              scope.colDefinitions = scope.colDefs;
            }

            for_each_branch = function(f) {
              var do_f, root_branch, _i, _len, _ref, _results;
              do_f = function(branch, level) {
                var child, _i, _len, _ref, _results;
                f(branch, level);
                if (branch.children != null) {
                  _ref = branch.children;
                  _results = [];
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    _results.push(do_f(child, level + 1));
                  }
                  return _results;
                }
              };
              _ref = scope.treeData;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                root_branch = _ref[_i];
                _results.push(do_f(root_branch, 1));
              }
              return _results;
            };
            selected_branch = null;
            select_branch = function(branch) {
              if (!branch) {
                if (selected_branch != null) {
                  selected_branch.selected = false;
                }
                selected_branch = null;
                return;
              }
              if (selected_branch != null) {
                selected_branch.selected = false;
              }
              branch.selected = true;
              selected_branch = branch;
              expand_all_parents(branch);
              if (branch.onSelect != null) {
                return $timeout(function() {
                  return branch.onSelect(branch);
                });
              } else {
                if (scope.onSelect != null) {
                  return $timeout(function() {
                    return scope.onSelect({
                      branch: branch
                    });
                  });
                }
              }
            };
            expand_branch = function(branch) {
              if (!branch) {
                if (selected_branch != null) {
                  selected_branch.selected = false;
                }
                selected_branch = null;
                return;
              }
              if (selected_branch != null) {
                selected_branch.selected = false;
              }
              branch.selected = true;
              selected_branch = branch;
              expand_all_parents(branch);
              if (branch.onSelect != null) {
                return $timeout(function() {
                  return branch.onExpand(branch);
                });
              } else {
                if (scope.onSelect != null) {
                  return $timeout(function() {
                    return scope.onExpand({
                      branch: branch
                    });
                  });
                }
              }
            };
            has_under_children = function(b, c) {
              var flag = false;
              if (b.children && b.children.length > 0) {
                for (var i in b.children) {
                  if (c.uid === b.children[i].uid)
                    flag = true;
                  else
                    flag = has_under_children(b.children[i], c);
                  if (flag === true)
                    break;
                }
              }
              return flag;
            }
            scope.on_user_click = function(branch) {
              if (scope.onClick) {
                scope.onClick({
                  branch: branch
                });
              }
            };
            scope.user_clicks_down = function(e) {
              e.stopPropagation();
            }
            scope.user_clicks_up = function(e) {
              e.stopPropagation();
            }
            scope.user_clicks_branch = function(branch, e) {
              if (e)
                e.stopPropagation();
              return expand_branch(branch);
            };
            scope.user_select_branch = function(branch) {
              return select_branch(branch);
            };
            remove_child = function(branch, child_branch) {
              for (var i = 0; i < branch.children.length; i++) {
                if (branch.children[i].uid === child_branch.uid) {
                  branch.children.splice(i, 1);
                }
              }
            };
            remove_tree = function(tree) {
              for (var i = 0; i < scope.treeData.length; i++) {
                if (scope.treeData[i].uid === tree.uid) {
                  scope.treeData.splice(i, 1);
                }
              }
            }
            move_update_branch = function(branch, selected_branch_temp) {
              if (!branch) {
                if (selected_branch != null) {
                  selected_branch.selected = false;
                }
                selected_branch = null;
                return;
              }
              if (branch !== selected_branch) {
                if (selected_branch != null) {
                  selected_branch.selected = false;
                }
                selected_branch = branch;
                var p = get_parent(selected_branch_temp)
                if (!has_under_children(selected_branch_temp, selected_branch)) {
                  if (p && p.uid !== selected_branch.uid) {
                    remove_child(p, selected_branch_temp);
                  } else
                    remove_tree(selected_branch_temp);
                  if (!p || p && p.uid !== selected_branch.uid) {
                    selected_branch_temp.parent_uid = selected_branch.uid;
                    selected_branch.children.push(copy_branch(selected_branch_temp));
                  }
                  selected_branch.expanded = true;
                  selected_branch.selected = true;
                }
                if (branch.onSelect != null) {
                  return $timeout(function() {
                    return branch.onSelect(branch);
                  });
                } else {
                  if (scope.onSelect != null) {
                    return $timeout(function() {
                      return scope.onMoveUpdate({
                        branch: selected_branch_temp,
                        targetBranch: selected_branch
                      });
                    });
                  }
                }
              }
            };
            copy_branch = function(branch) {
              branch.uid = Math.random();
              branch.expanded = false;
              return branch;
            };
            scope.moseMoveHandler = function(e, flag) {
              var offset = element.offset();
              scope.info.position.left = e.pageX - offset.left + 10;
              scope.info.position.top = e.pageY - offset.top + 10;
              if (!flag)
                scope.$apply();
            };
            scope.user_mousedown_branch = function(branch, $event) {
              if (scope.allowMove !== false) {
                if (!branch) {
                  if (selected_branch != null) {
                    selected_branch.selected = false;
                  }
                  selected_branch = null;
                  return;
                }
                if (branch !== selected_branch) {
                  if (selected_branch != null) {
                    selected_branch.selected = false;
                  }
                  branch.selected = true;
                  selected_branch = branch;
                }
                scope.moseMoveHandler($event, 1);
                scope.info.show = true;
                scope.info.content = branch;
                element.css({
                  "cursor": "move"
                });
                element.on('mousemove', scope.moseMoveHandler);
                element.on('mouseup', function() {
                  element.unbind('mousemove', scope.moseMoveHandler);
                  element.css({
                    "cursor": "default"
                  });
                });
              }
            };
            scope.user_mouseup_branch = function(branch, $event) {
              if (scope.allowMove !== false) {
                scope.moseMoveHandler($event, 1);
                scope.info.show = false;
                var selected_branch_temp = selected_branch;
                if (branch !== selected_branch) {
                  return move_update_branch(branch, selected_branch_temp);
                }
              }
            };
            scope.user_mouseup_checkbox = function(branch, $event) {
              halt($event);
            };
            scope.user_mousedown_checkbox = function(branch, $event) {
              halt($event);
            };
            scope.user_click_checkbox = function(branch, $event) {
              halt($event);
              if (branch.checked === true) {
                branch.checked = false;
                uncheck_all_children(branch);
                uncheck_all_parent(branch);
              } else {
                branch.checked = true;
                check_all_parent(branch);
                check_all_children(branch);
              }
            };

            function halt($event) {
              $event.preventDefault();
              $event.stopPropagation();
              $event.returnValue = false;
              $event.cancelBubble = true;
            };
            get_parent = function(child) {
              var parent;
              parent = void 0;
              if (child.parent_uid) {
                for_each_branch(function(b) {
                  if (b.uid === child.parent_uid) {
                    return parent = b;
                  }
                });
              }
              return parent;
            };
            for_all_ancestors = function(child, fn) {
              var parent;
              parent = get_parent(child);
              if (parent != null) {
                fn(parent);
                return for_all_ancestors(parent, fn);
              }
            };
            expand_all_parents = function(child) {
              return for_all_ancestors(child, function(b) {
                return b.expanded = true;
              });
            };

            scope.tree_rows = [];

            on_treeData = function() {
              on_treeData_change();
              if (scope.treeData.$resolved == true) {
                if (scope.onTreeDataPromised)
                  scope.onTreeDataPromised();
              }
            };
            on_treeData_change = function() {
              getExpandingProperty();

              var add_branch_to_list, root_branch, _i, _len, _ref, _results;
              for_each_branch(function(b, level) {
                if (!b.uid) {
                  return b.uid = "" + Math.random();
                }
              });
              for_each_branch(function(b) {
                var child, _i, _len, _ref, _results;
                if (angular.isArray(b.children)) {
                  _ref = b.children;
                  _results = [];
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    _results.push(child.parent_uid = b.uid);
                  }
                  return _results;
                }
              });
              scope.tree_rows = [];
              for_each_branch(function(branch) {
                var child, f;
                if (branch.children) {
                  if (branch.children.length > 0) {
                    f = function(e) {
                      if (typeof e === 'string') {
                        return {
                          label: e,
                          children: []
                        };
                      } else {
                        return e;
                      }
                    };
                    return branch.children = (function() {
                      var _i, _len, _ref, _results;
                      _ref = branch.children;
                      _results = [];
                      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        _results.push(f(child));
                      }
                      return _results;
                    })();
                  }
                } else {
                  return branch.children = [];
                }
              });
              add_branch_to_list = function(level, branch, visible) {
                var child, child_visible, tree_icon, _i, _len, _ref, _results;
                if (branch.expanded == null) {
                  branch.expanded = false;
                }
                /*if (!branch.children || branch.children.length === 0) {
                  tree_icon = attrs.iconLeaf;
                } else {
                  if (branch.expanded) {
                    tree_icon = attrs.iconCollapse;
                  } else {
                    tree_icon = attrs.iconExpand;
                  }
                }*/
                if (branch.expanded) {
                  tree_icon = attrs.iconCollapse;
                } else {
                  tree_icon = attrs.iconExpand;
                }
                branch.level = level;
                scope.tree_rows.push({
                  level: level,
                  branch: branch,
                  label: branch[expandingProperty],
                  tree_icon: tree_icon,
                  visible: visible
                });
                if (branch.children != null) {
                  _ref = branch.children;
                  _results = [];
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    child = _ref[_i];
                    child_visible = visible && branch.expanded;
                    _results.push(add_branch_to_list(level + 1, child, child_visible));
                  }
                  return _results;
                }
              };
              _ref = scope.treeData;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                root_branch = _ref[_i];
                _results.push(add_branch_to_list(1, root_branch, true));
              }
              return _results;
            };

            scope.$watch('treeData', on_treeData, true);

            if (attrs.initialSelection != null) {
              for_each_branch(function(b) {
                if (b.label === attrs.initialSelection) {
                  return $timeout(function() {
                    return select_branch(b);
                  });
                }
              });
            }
            n = scope.treeData.length;
            for_each_branch(function(b, level) {
              b.level = level;
              return b.expanded = b.level < expand_level;
            });

            order_up = function(branch) {
              var parent = get_parent(branch);
              if (parent) {
                if (get_first_child(parent).uid == branch.uid) {
                  return $timeout(function() {
                    return scope.onOrderUp({
                      branch: branch,
                      ebranch: null
                    });
                  });
                } else {
                  for (var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i].uid == branch.uid) {
                      var pre_branch = get_prev_sibling(branch);
                      parent.children.splice(i - 1, 2);
                      parent.children.splice(i - 1, 0, branch, pre_branch);
                      return $timeout(function() {
                        return scope.onOrderUp({
                          branch: branch,
                          ebranch: pre_branch
                        });
                      });
                    }
                  }
                }
              } else {
                if (scope.treeData[0].uid == branch.uid) {
                  return $timeout(function() {
                    return scope.onOrderUp({
                      branch: branch,
                      ebranch: null
                    });
                  });
                } else {
                  for (var i = 0; i < scope.treeData.length; i++) {
                    if (scope.treeData[i].uid == branch.uid) {
                      var pre_branch = get_prev_sibling(branch);
                      scope.treeData.splice(i - 1, 2);
                      scope.treeData.splice(i - 1, 0, branch, pre_branch);
                      return $timeout(function() {
                        return scope.onOrderUp({
                          branch: branch,
                          ebranch: pre_branch
                        });
                      });
                    }
                  }
                }
              }
            };
            order_down = function(branch) {
              var parent = get_parent(branch);
              if (parent) {
                if (get_last_child(parent).uid == branch.uid) {
                  return $timeout(function() {
                    return scope.onOrderDown({
                      branch: branch,
                      ebranch: null
                    });
                  });
                } else {
                  for (var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i].uid == branch.uid) {
                      var next_branch = get_next_sibling(branch);
                      parent.children.splice(i, 2);
                      parent.children.splice(i, 0, next_branch, branch);
                      return $timeout(function() {
                        return scope.onOrderDown({
                          branch: branch,
                          ebranch: next_branch
                        });
                      });
                    }
                  }
                }
              } else {
                if (scope.treeData[scope.treeData.length - 1].uid == branch.uid) {
                  return $timeout(function() {
                    return scope.onOrderDown({
                      branch: branch,
                      ebranch: null
                    });
                  });
                } else {
                  for (var i = 0; i < scope.treeData.length; i++) {
                    if (scope.treeData[i].uid == branch.uid) {
                      var next_branch = get_next_sibling(branch);
                      scope.treeData.splice(i, 2);
                      scope.treeData.splice(i, 0, next_branch, branch);
                      return $timeout(function() {
                        return scope.onOrderDown({
                          branch: branch,
                          ebranch: next_branch
                        });
                      });
                    }
                  }
                }
              }
            };
            get_prev_sibling = function(b) {
              var i, siblings;
              if (b == null) {
                b = selected_branch;
              }
              siblings = get_siblings(b);
              n = siblings.length;
              i = siblings.indexOf(b);
              if (i > 0) {
                return siblings[i - 1];
              }
            };
            get_siblings = function(b) {
              var p, siblings;
              if (b == null) {
                b = selected_branch;
              }
              if (b != null) {
                p = get_parent(b);
                if (p) {
                  siblings = p.children;
                } else {
                  siblings = scope.treeData;
                }
                return siblings;
              }
            };

            get_first_child = function(b) {
              var _ref;
              if (b == null) {
                b = selected_branch;
              }
              if (b != null) {
                if (((_ref = b.children) != null ? _ref.length : void 0) > 0) {
                  return b.children[0];
                }
              }
            };
            get_last_child = function(b) {
              var _ref;
              if (b == null) {
                b = selected_branch;
              }
              if (b != null) {
                if (((_ref = b.children) != null ? _ref.length : void 0) > 0) {
                  return b.children[_ref.length - 1];
                }
              }
            };
            get_next_sibling = function(b) {
              var i, siblings;
              if (b == null) {
                b = selected_branch;
              }
              if (b != null) {
                siblings = get_siblings(b);
                n = siblings.length;
                i = siblings.indexOf(b);
                if (i < n) {
                  return siblings[i + 1];
                }
              }
            };

            function find_branch(arr, obj) {
              if (arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                  var all = true;
                  for (var key in obj) {
                    if (arr[i][key] != obj[key]) {
                      all = false;
                      break;
                    }
                  }
                  if (all == true)
                    return arr[i];
                }
              }
              return null;
            }
            find_tree_by_condition = function(obj) {
              return find_branch(scope.treeData, obj);
            };
            find_branch_by_condition = function(parent, obj) {
              if (parent)
                return find_branch(parent.children, obj);
              return null;
            };
            // checkbox选中父节点
            check_parent = function(branch) {
              if (branch) {
                var p = get_parent(branch);
                if (p)
                  p.checked = true;
              }
            };
            // checkbox选中所有父节点
            check_all_parent = function(branch) {
              while (branch) {
                check_parent(branch);
                branch = get_parent(branch);
              }
            };
            // checkbox不选中子节点
            uncheck_chilren = function(branch) {
              if (branch) {
                var children = get_children(branch);
                if (children && children.length > 0) {
                  for (var i = 0; i < children.length; i++) {
                    children[i].checked = false;
                  }
                }
              }
            };
            // checkbox不选中所有子节点
            uncheck_all_children = function(branch) {
              uncheck_chilren(branch);
              var children = get_children(branch);
              if (children && children.length > 0) {
                for (var i = 0; i < children.length; i++) {
                  uncheck_all_children(children[i]);
                }
              }
            };
            get_children = function(branch) {
              return branch.children;
            };
            // checkbox选中子节点
            check_children = function(branch) {
              if (branch) {
                var children = get_children(branch);
                if (children && children.length > 0) {
                  for (var i = 0; i < children.length; i++) {
                    children[i].checked = true;
                  }
                }
              }
            };
            // checkbox选中所有子节点
            check_all_children = function(branch) {
              check_children(branch);
              var children = get_children(branch);
              if (children && children.length > 0) {
                for (var i = 0; i < children.length; i++) {
                  check_all_children(children[i]);
                }
              }
            };
            // 当前节点的所有子节点是否都被选中
            is_all_children_checked = function(branch) {
              var flag = true;
              var children = get_children(branch);
              if (children && children.length > 0) {
                for (var i = 0; i < children.length; i++) {
                  if (children[i].checked === false) {
                    flag = false;
                    break;
                  }
                }
              }
              return flag;
            };
            // 当前节点的所有子节点是否都未被选中
            is_all_children_unchecked = function(branch) {
              var flag = true;
              var children = get_children(branch);
              if (children && children.length > 0) {
                for (var i = 0; i < children.length; i++) {
                  if (children[i].checked === true) {
                    flag = false;
                    break;
                  }
                }
              }
              return flag;
            };
            // 父节点checkbox不选中
            uncheck_parent = function(branch) {
              if (branch) {
                var parent = get_parent(branch);
                if (parent && is_all_children_unchecked(parent)); {
                  parent.checked = false;
                }
              };
            };
            // 所有父节点checkbox不选中
            uncheck_all_parent = function(branch) {
              var parent = get_parent(branch);
              if (parent) {
                if (is_all_children_unchecked(parent))
                  uncheck_parent(branch);
                uncheck_all_parent(parent);
              }
            };
            get_treeData = function() {
              return scope.treeData;
            };
            if (scope.treeControl != null) {
              if (angular.isObject(scope.treeControl)) {
                tree = scope.treeControl;
                tree.check_parent = function(branch) {
                  return check_parent(branch);
                };
                tree.check_all_parent = function(branch) {
                  return check_all_parent(branch);
                };
                tree.uncheck_chilren = function(branch) {
                  return uncheck_chilren(branch);
                };
                tree.uncheck_all_children = function(branch) {
                  return uncheck_all_children(branch);
                };
                tree.check_children = function(branch) {
                  return check_children(branch);
                };
                tree.check_all_children = function(branch) {
                  return check_all_children(branch);
                };
                tree.is_all_children_checked = function(branch) {
                  return is_all_children_checked(branch);
                };
                tree.is_all_children_unchecked = function(branch) {
                  return is_all_children_unchecked(branch);
                };
                tree.uncheck_parent = function(branch) {
                  return uncheck_parent(branch);
                };
                tree.uncheck_all_parent = function(branch) {
                  return uncheck_all_parent(branch);
                };
                tree.get_treeData = function() {
                  return get_treeData();
                };
                tree.order_up = function(branch) {
                  return order_up(branch);
                };
                tree.order_down = function(branch) {
                  return order_down(branch);
                };
                tree.expand_all = function() {
                  return for_each_branch(function(b, level) {
                    return b.expanded = true;
                  });
                };
                tree.collapse_all = function() {
                  return for_each_branch(function(b, level) {
                    return b.expanded = false;
                  });
                };
                tree.get_first_branch = function() {
                  n = scope.treeData.length;
                  if (n > 0) {
                    return scope.treeData[0];
                  }
                };
                tree.select_first_branch = function() {
                  var b;
                  b = tree.get_first_branch();
                  return tree.select_branch(b);
                };
                tree.get_selected_branch = function() {
                  return selected_branch;
                };
                tree.get_parent_branch = function(b) {
                  return get_parent(b);
                };
                tree.select_branch = function(b) {
                  select_branch(b);
                  return b;
                };
                tree.get_children = function(b) {
                  return get_children(b);
                };
                tree.select_parent_branch = function(b) {
                  var p;
                  if (b == null) {
                    b = tree.get_selected_branch();
                  }
                  if (b != null) {
                    p = tree.get_parent_branch(b);
                    if (p != null) {
                      tree.select_branch(p);
                      return p;
                    }
                  }
                };
                tree.add_branch = function(parent, new_branch) {
                  if (parent != null) {
                    parent.children.push(new_branch);
                    parent.expanded = true;
                  } else {
                    scope.treeData.push(new_branch);
                  }
                  return new_branch;
                };
                tree.add_root_branch = function(new_branch) {
                  tree.add_branch(null, new_branch);
                  return new_branch;
                };
                tree.expand_branch_remote = function(branch) {
                  return expand_branch(branch);
                };
                tree.expand_branch = function(b) {
                  if (b == null) {
                    b = tree.get_selected_branch();
                  }
                  if (b != null) {
                    b.expanded = true;
                    return b;
                  }
                };
                tree.collapse_branch = function(b) {
                  if (b == null) {
                    b = selected_branch;
                  }
                  if (b != null) {
                    b.expanded = false;
                    return b;
                  }
                };
                tree.get_siblings = function(b) {
                  return get_siblings(b);
                };
                tree.get_next_sibling = function(b) {
                  return get_next_sibling(b);
                };
                tree.get_prev_sibling = function(b) {
                  return get_prev_sibling(b);
                };
                tree.select_next_sibling = function(b) {
                  var next;
                  if (b == null) {
                    b = selected_branch;
                  }
                  if (b != null) {
                    next = tree.get_next_sibling(b);
                    if (next != null) {
                      return tree.select_branch(next);
                    }
                  }
                };
                tree.select_prev_sibling = function(b) {
                  var prev;
                  if (b == null) {
                    b = selected_branch;
                  }
                  if (b != null) {
                    prev = tree.get_prev_sibling(b);
                    if (prev != null) {
                      return tree.select_branch(prev);
                    }
                  }
                };
                tree.get_first_child = function(b) {
                  return get_first_child(b);
                };
                tree.get_last_child = function(b) {
                  return get_last_child(b);
                };
                tree.get_closest_ancestor_next_sibling = function(b) {
                  var next, parent;
                  next = tree.get_next_sibling(b);
                  if (next != null) {
                    return next;
                  } else {
                    parent = tree.get_parent_branch(b);
                    return tree.get_closest_ancestor_next_sibling(parent);
                  }
                };
                tree.get_next_branch = function(b) {
                  var next;
                  if (b == null) {
                    b = selected_branch;
                  }
                  if (b != null) {
                    next = tree.get_first_child(b);
                    if (next != null) {
                      return next;
                    } else {
                      next = tree.get_closest_ancestor_next_sibling(b);
                      return next;
                    }
                  }
                };
                tree.select_next_branch = function(b) {
                  var next;
                  if (b == null) {
                    b = selected_branch;
                  }
                  if (b != null) {
                    next = tree.get_next_branch(b);
                    if (next != null) {
                      tree.select_branch(next);
                      return next;
                    }
                  }
                };
                tree.last_descendant = function(b) {
                  var last_child;
                  if (b == null) {
                    debugger;
                  }
                  n = b.children.length;
                  if (n === 0) {
                    return b;
                  } else {
                    last_child = b.children[n - 1];
                    return tree.last_descendant(last_child);
                  }
                };
                tree.get_prev_branch = function(b) {
                  var parent, prev_sibling;
                  if (b == null) {
                    b = selected_branch;
                  }
                  if (b != null) {
                    prev_sibling = tree.get_prev_sibling(b);
                    if (prev_sibling != null) {
                      return tree.last_descendant(prev_sibling);
                    } else {
                      parent = tree.get_parent_branch(b);
                      return parent;
                    }
                  }
                };
                tree.set_branch_loaded = function(branch, callback) {
                  if (branch)
                    branch.loaded = true;
                  if (callback)
                    callback(branch);
                };
                tree.find_branch_by_condition = function(parent, obj) {
                  return find_branch_by_condition(parent, obj);
                };
                tree.find_tree_by_condition = function(obj) {
                  return find_tree_by_condition(obj);
                }

                tree.select_prev_branch = function(b) {
                  var prev;
                  if (b == null) {
                    b = selected_branch;
                  }
                  if (b != null) {
                    prev = tree.get_prev_branch(b);
                    if (prev != null) {
                      tree.select_branch(prev);
                      return prev;
                    }
                  }
                };
                return tree;
              }
            }
          }
        };
      }
    ])

  .provider('treegridTemplate', function() {
    var templatePath = 'template/treeGrid/treeGrid.html';

    this.setPath = function(path) {
      templatePath = path;
    };

    this.$get = function() {
      return {
        getPath: function() {
          return templatePath;
        }
      };
    };
  })
}).call(window);