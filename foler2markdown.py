import sys
import os

ignores = ['web/src/core/sse', 'web/src/core/messages/merge-message.ts', 'web/src/core/mcp', 'web/src/core/api/rag.ts', 'web/src/core/api/chat.ts', 'web/src/core/replay', 'web/src/app/settings', 'web/src/app/landing', 'web/src/app/page.tsx', 'web/src/components/deer-flow/resource-mentions.tsx', 'web/src/components/deer-flow/language-switcher.tsx', 'web/src/components/deer-flow/report-style-dialog.tsx', 'web/src/components/deer-flow/link.tsx', 'web/src/i18n.ts']


def get_file_language(file_path):
    """Get the appropriate language identifier for code blocks based on file extension"""
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    return ext[1:] if len(ext) > 0 else ext

def convert_folder_to_markdown(folder_path, markdown_file, extends):
    with open(markdown_file, 'w') as md_file:
        # Write the title of the markdown
        md_file.write(f"# Folder Structure of {folder_path}\n\n")

        # Walk through the directory
        for root, dirs, files in os.walk(folder_path):
            print(root)
            # 排除 CLAM 文件夹（无论路径里哪里出现）
            if "CLAM" in root or '.venv' in root or '__pycache__' in root or '.git' in root:
                continue

            if './web/src' not in root: # and './src' not in root:
                continue
            
            ignore = False
            for x in ignores:
                if x in root:
                    ignore = True
                    break
            if ignore:
                continue

            # Write the directory structure
            level = root.replace(folder_path, '').count(os.sep)
            indent = ' ' * 4 * (level)
            md_file.write(f"{indent}## {os.path.basename(root)}\n")

            # Write the files in the directory
            if files:
                for file in files:
                    # 排除 CLAM 里的文件
                    file_path = os.path.join(root, file)
                    if 'CLAM' in file_path.split(os.sep):
                        continue
                    md_file.write(f"{indent} - {file}\n")
            md_file.write("\n")

            # Process each file and include its content (optional)
            for file in files:
                file_path = os.path.join(root, file)
                # 排除 CLAM 里的文件
                if 'CLAM' in file_path.split(os.sep):
                    continue
                relative_path = os.path.relpath(file_path, folder_path)
                language = get_file_language(file_path)
                if 'venv/' in file_path:
                   continue

                if extends != 'all' and language not in extends.split(','):
                   continue
                try:
                    with open(file_path, 'r', encoding='utf-8') as content_file:
                        content = content_file.read()
                    md_file.write(f"### {relative_path} Content:\n\n")
                    md_file.write(f"```{language}\n{content}\n```\n\n")
                except UnicodeDecodeError:
                    md_file.write(f"### {relative_path} Content:\n\n")
                    md_file.write(f"```txt\n[Binary file or unsupported encoding - content not displayed]\n```\n\n")
                except Exception as e:
                    md_file.write(f"### {relative_path} Content:\n\n")
                    md_file.write(f"```txt\n[Error reading file: {str(e)}]\n```\n\n")


# # Example usage:
# folder_path = sys.argv[1]
# markdown_file = sys.argv[2] + '.md'
# if len(sys.argv) > 3:
#     extends = sys.argv[3]
# else:
#     extends = 'python'

# convert_folder_to_markdown(folder_path, markdown_file, extends)

# convert_folder_to_markdown('./trima/healnet/models', 'docs/trima_models.md', 'py,yaml,sh,md')
convert_folder_to_markdown('./', '/Users/ann/Documents/projects/deer-flow-dev/deer-flow-documents/deer.md', 'all') # ,md
# convert_folder_to_markdown('/hpc2hdd/home/fhuang743/trima/few_shot/minimal_project', 'docs/baseline.md', 'py,yaml,sh,md,bash')

