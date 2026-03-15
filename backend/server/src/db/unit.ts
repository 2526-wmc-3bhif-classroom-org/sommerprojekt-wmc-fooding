// NO AI used here, but copied code from the CRUD Flightmanagement exercise and adjusted it


import BetterSqlite3 from "better-sqlite3";
import type { Database } from "better-sqlite3";
import { DB } from "./database";

type RawStatement<TResult> = BetterSqlite3.Statement<unknown[], TResult>;
type RunResult = ReturnType<RawStatement<unknown>["run"]>;

export interface ITypedStatement<TResult = unknown, TParams = Record<string, unknown>> {
    readonly _params?: TParams;
    get(): TResult | undefined;
    all(): TResult[];
    run(): RunResult;
}

export class Unit {
    private readonly db: Database;
    private completed: boolean;

    public constructor(public readonly readOnly: boolean) {
        this.completed = false;
        this.db = DB.createDBConnection();

        if (!this.readOnly) {
            DB.beginTransaction(this.db);
        }
    }

    public prepare<TResult, TParams extends Record<string, unknown> = Record<string, unknown>>(
        sql: string,
        bindings?: TParams
    ): ITypedStatement<TResult, TParams> {
        const stmt = this.db.prepare(sql) as BetterSqlite3.Statement<[TParams], TResult>;

        if (bindings != null) {
            stmt.bind(bindings);
        }

        return stmt as unknown as ITypedStatement<TResult, TParams>;
    }

    public getLastRowId(): number {
        const stmt = this.prepare<{ id: number }>("SELECT last_insert_rowid() AS id");
        const result = stmt.get();

        if (!result) {
            throw new Error("Unable to retrieve last inserted row id");
        }

        return result.id;
    }

    public complete(commit: boolean | null = null): void {
        if (this.completed) {
            return;
        }

        this.completed = true;

        if (commit !== null) {
            if (!this.readOnly) {
                if (commit) {
                    DB.commitTransaction(this.db);
                } else {
                    DB.rollbackTransaction(this.db);
                }
            }
        } else if (!this.readOnly) {
            throw new Error("Transaction is open. You must explicitly commit or rollback.");
        }

        this.db.close();
    }
}